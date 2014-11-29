# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

(($, window) ->
	margin = {top: 5, right: 5, bottom: 30, left: 50}
	height = 400 - margin.top - margin.bottom
	color = d3.scale.category20()

	class CategoryGraphs
		constructor: (selector, @name) ->
			@svg = d3.select(selector)
			@stats = {}
			@categories = {}

		initialize: ->
			@graph = @svg.attr("width", '100%')
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(#{margin.left}, #{margin.top})")
			@width = @compute_width()

			@x_scale = d3.scale.ordinal().rangeRoundBands([0, @width], .1)
			@x_axis = d3.svg.axis()
				.scale(@x_scale)
		    .tickSize(5)
		    .tickPadding(6)
				.orient("bottom")

			@y_scale = d3.scale.linear().range([height, 0], .1)
			@y_axis = d3.svg.axis()
				.scale(@y_scale)
				.orient("left")
		    .tickSize(5)
				.tickFormat(d3.format ".2s")

			@x_axis_element = @graph.append('g')
				.attr('class', 'axis axis-x')
				.attr('transform', "translate(0, #{height})")
			@x_axis_element.call(@x_axis)

			@y_axis_element = @graph.append('g')
				.attr('class', 'axis axis-y')
			@y_axis_element.call(@y_axis)
			@y_axis_element.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text(@name)

			this

		compute_width: ->
			parseInt(@svg.style 'width') - margin.left - margin.right

		get_categories: (filter_categories) ->
			d3.keys(@categories).sort()

		get_months: ->
			d3.keys(@stats).sort()

		add_data: (month, data) ->
			@stats[month] = data

			for category, sum of data
				@categories[category] = true if !(category of @categories)

			@render()

		clean: ->
			@graph.selectAll('.layer').remove()
			@graph.selectAll('.legend').remove()

		render: ->
			@clean()

			categories = @get_categories()
			return if categories.length == 0

			layers = for category in categories
				( { x: month, y: (if @categories[category] then @stats[month][category] else 0) || 0 } for month, i in @get_months() )
			stacks = d3.layout.stack()(layers)

			# Redefinition of scales domains
			@x_scale.domain @get_months()
			@x_scale.rangeRoundBands([0, @width], .1)

			yStackMax = d3.max(stacks, (stack) -> d3.max(stack, (d) -> d.y0 + d.y ) )
			@y_scale.domain([0, yStackMax])

			color.domain(categories)

			@x_axis_element.call @x_axis
			@y_axis_element.call @y_axis

			# Data processing
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
					.attr("class", (category) => if @categories[category] then 'legend legend-selected' else 'legend legend-hidden')
					.attr("transform", (d, i) -> "translate(0," + i * 20 + ")")
					.on('click', (category) =>
						@categories[category] = !@categories[category]
						@render()
					)

			legend.append("rect")
				.attr("x", @width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", (d, i) -> color i )

			legend.append("text")
				.attr("x", @width - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text((d) -> d)

			undefined

		resize: ->
			@width = @compute_width()
			@render()

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

		d3.select(window).on 'resize', ->
			revenues.resize()
			expenses.resize()

	# Handle both new page and turbolink change
	$(document).ready on_load
	$(document).on "page:load", on_load

) jQuery, window