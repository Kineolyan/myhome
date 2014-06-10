module Comptes

  class ComptesController < ApplicationController
    def index
      @comptes = Compte.all

      respond_to do |format|
        format.html { render }
        format.json { render json: @comptes }
      end
    end

    def new
      @compte = Compte.new()
    end

    def create
      @compte = Compte.new comptes_params

      if @compte.save
        redirect_to @compte
      else
        render 'new'
      end
    end

    def show
      @compte = Compte.find_by_id(params[:id])

      respond_to do |format|
        format.html { render }
        format.json { render json: @compte }
      end
    end

    def update
    end

    def comptes_params
      params.require(:comptes_compte).permit(:nom, :solde)
    end
  end

end # module Comptes