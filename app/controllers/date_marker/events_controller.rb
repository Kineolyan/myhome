module DateMarker

  class EventsController < ApplicationController
    def index
      @events = Event.all
    end

    def show
      @event = Event.find_by_id params[:id]
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
      @event = Event.find_by_id params[:id]
    end

    def update
      @event = Event.find_by_id params[:id]
      unless @event
        render :edit
      end

      if @event.update event_params
        redirect_to @event
      else
        render :edit
      end
    end

    private
    def event_params
      params.require(:date_marker_event).permit(:title, :day)
    end
  end

end