module Comptes

  class ComptesController < ApplicationController
    def index
      @comptes = Compte.all
    end

    def new
      @compte = Compte.new()
    end

    def create
      parameters = format_params(comptes_params)
      @compte = Compte.new parameters

      if @compte.save
        redirect_to @compte
      else
        render 'new'
      end
    end

    def show
      @compte = Compte.find_by_id(params[:id])
    end

    def edit
      @compte = Compte.find_by_id(params[:id])
    end

    def update
      @compte = Compte.find_by_id params[:id]
      unless @compte
        respond_to do |format|
          format.html { render :update }
          format.json { render json: { errors: "Le compte #{params[:id]} n'existe pas." } }
        end
      end

      parameters = format_params comptes_params
      # Pour l'instant, on ne touche pas au solde
      parameters.delete :solde_historique

      if @compte.update parameters
        respond_to do |format|
          format.html { render :show }
          format.json { render json: @compte }
        end
      else
        respond_to do |format|
          format.html { render :edit }
          format.json { render json: { errors: @compte.errors } }
        end
      end
    end

    private
    def comptes_params
      params.require(:comptes_compte).permit(:nom, :solde_historique)
    end

    def format_params parameters
      solde_historique = parameters[:solde_historique]
      parameters[:solde_historique] = (solde_historique.to_f * 100).to_i if ApplicationHelper.is_a_number? solde_historique

      parameters
    end
  end

end # module Comptes