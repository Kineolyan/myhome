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

    def update
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