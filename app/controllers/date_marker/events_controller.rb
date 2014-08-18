module DateMarker

  class EventsController < ApplicationController
    before_action :get_event, on: [:show, :edit, :update, :get_day]

    def index
      @events = Event.all
    end

    def show
    end

    def new
      @event = Event.new
    end

    def create
      @event = Event.new event_params
      # @event.day = Date::parse

      if @event.save
        redirect_to @event
      else
        render 'new'
      end
    end

    def edit
    end

    def update
      unless @event
        render :edit
      end

      if @event.update event_params
        redirect_to @event
      else
        render :edit
      end
    end

    def get_day
      @dates = {}
      return unless @event

      if request.post?
        time_span = params[:time_span] ? params[:time_span].to_sym : nil

        unless ApplicationHelper::is_a_number? params[:number]
          flash.now[:error] = "'#{params[:number]}' is not a number"
          return
        end
        number = params[:number].to_i

        case time_span
        when :days
          @dates["#{number} jours"] = @event.day + number
        when :months
          @dates["#{number} mois"] = @event.day >> number
        else
          flash.now[:error] = "'#{params[:time_span]}' is an invalid time span"
        end
      end
    end

    private
      def event_params
        params.require(:date_marker_event).permit(:title, :day)
      end

      def get_event
        @event = Event.find_by_id params[:id]
      end
  end

end