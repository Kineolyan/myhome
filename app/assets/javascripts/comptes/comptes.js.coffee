# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

(($) ->
	margin = {top: 20, right: 20, bottom: 30, left: 40}
	width = 960 - margin.left - margin.right
	height = 400 - margin.top - margin.bottom
	color = d3.scale.category20()

	class CategoryGraphs
		constructor: (selector) ->
			@graph = d3.select(selector)
			@form = $('#statistics-form')
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

			@y_scale = d3.scale.linear().range([0, height], .1)
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
					.text("Consommation par catégorie")

			@form.submit (event) =>
				event.preventDefault()

				month = @form.find('input[name="month"]').val()
				account = @form.find('input[name="id"]').val()
				@get_statistics(month, account)

				false

		get_categories: ->
			Object.keys(@categories).sort()

		get_months: ->
			Object.keys(@stats).sort()

		get_statistics: (month, account) ->
			$.ajax {
				url: '#',
				type: 'POST',
				dataType: "json",
				data: { month: month },
				success: (data) =>
					console.log data
					@stats[month] = data

					for category, expenses of data
						@categories[category] = true

					@render()

					undefined
				,
				error: (data) ->
					alert "Failed to get stats for account #{account} at #{month}"
			}

		clean: ->
			@graph.selectAll('.layer').remove()
			@graph.selectAll('.legend').remove()

		render: ->
			categories = @get_categories()

			layers = for category in categories
				( {x: i, y: @stats[month][category]} for month, i in @get_months() )
			stacks = d3.layout.stack()(layers)

			yStackMin = d3.min(stacks, (stack) -> d3.min(stack, (d) -> d.y0 + d.y ) )
			yStackMax = d3.max(stacks, (stack) -> d3.max(stack, (d) -> d.y0 + d.y ) )
			@x_scale.domain d3.range @get_months().length
			@y_scale.domain([yStackMin, yStackMax])
			color.domain(categories);

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
					.attr("height", (d) => @y_scale(d.y0 + d.y) - @y_scale(d.y0) )

			legend = @graph.selectAll(".legend")
				.data(categories)
				.enter().append("g")
					.attr("class", "legend")
					.attr("transform", (d, i) -> "translate(0," + i * 20 + ")")

			legend.append("rect")
				.attr("x", width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", color);

			legend.append("text")
				.attr("x", width - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text((d) -> d)

			undefined

	$ ->
		graph = new CategoryGraphs "#categories-graphs"
		graph.initialize()

) jQuery