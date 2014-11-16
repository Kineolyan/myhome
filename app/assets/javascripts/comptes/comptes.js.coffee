# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

(($) ->
	margin = {top: 20, right: 20, bottom: 30, left: 40}
	width = 480 - margin.left - margin.right
	height = 400 - margin.top - margin.bottom
	color = d3.scale.category20()

	class CategoryGraphs
		constructor: (selector, @name) ->
			@graph = d3.select(selector)
			@stats = {}
			@categories = {}

		initialize: ->
			@graph
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(#{margin.left}, #{margin.top})")

			@x_scale = d3.scale.ordinal().rangeRoundBands([0, width], .1)
			@x_axis = d3.svg.axis()
				.scale(@x_scale)
				.tickSize(0)
				.tickPadding(6)
				.orient("bottom")

			@y_scale = d3.scale.linear().range([height, 0], .1)
			@y_axis = d3.svg.axis()
				.scale(@y_scale)
				.orient("left")
				.tickFormat(d3.format ".2s")

			@graph.append('g')
				.attr('class', 'axis axis-x')
				.attr('transform', "translate(0, #{height})")
				.call(@x_axis)

			@graph.append('g')
				.attr('class', 'axis axis-y')
				.call(@y_axis)
				.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(@name)

			this

		get_categories: ->
			Object.keys(@categories).sort()

		get_months: ->
			Object.keys(@stats).sort()

		add_data: (month, data) ->
			@stats[month] = data

			for category, sum of data
				@categories[category] = true

			@render()

		clean: ->
			@graph.selectAll('.layer').remove()
			@graph.selectAll('.legend').remove()

		render: ->
			@clean()

			categories = @get_categories()
			return if categories.length == 0

			layers = for category in categories
				( { x: i, y: @stats[month][category] || 0 } for month, i in @get_months() )
			stacks = d3.layout.stack()(layers)

			# Redefinition of scales domains
			@x_scale.domain d3.range @get_months().length

			yStackMax = d3.max(stacks, (stack) -> d3.max(stack, (d) -> d.y0 + d.y ) )
			@y_scale.domain([0, yStackMax])

			color.domain(categories)

			$layers = @graph.selectAll(".layer")
					.data(stacks)
					.enter().append("g")
						.attr("class", "layer")
						.style("fill", (d, i) -> color(i) )

			$rects = $layers.selectAll("rect")
				.data((d) -> d )
				.enter().append("rect")
					.attr("x", (d) => @x_scale d.x )
					.attr("width", @x_scale.rangeBand() )
					.attr("y", (d) => @y_scale d.y0 + d.y )
					.attr("height", (d) => @y_scale(d.y0) - @y_scale(d.y0 + d.y) )

			legend = @graph.selectAll(".legend")
				.data(categories)
				.enter().append("g")
					.attr("class", "legend")
					.attr("transform", (d, i) -> "translate(0," + i * 20 + ")")

			legend.append("rect")
				.attr("x", width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", (d, i) -> color i )

			legend.append("text")
				.attr("x", width - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text((d) -> d)

			undefined

	on_load = () ->
		return if $('#revenues-graphs').length == 0

		revenues = (new CategoryGraphs "#revenues-graphs", 'Revenus par catégories').initialize()
		expenses = (new CategoryGraphs "#expenses-graphs", 'Dépenses par categories').initialize()

		$('#month-calendar .month').click () ->
			month = $(this).data('month')
			account = $(this).data('account')

			$.ajax {
				url: '#',
				type: 'POST',
				dataType: "json",
				data: { month: month, id: account },
				success: (data) =>
					console.log data

					revenues.add_data(month, data.credit)
					expenses.add_data(month, data.debit)

					undefined
				,
				error: (data) ->
					alert "Failed to get stats for account #{account} at #{month}"
			}

	# Handle both new page and turbolink change
	$(document).ready on_load
	$(document).on "page:load", on_load

) jQuery