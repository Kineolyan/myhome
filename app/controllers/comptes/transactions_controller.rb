module Comptes

  class TransactionsController < ApplicationController

    def index
      @transactions = Transaction.order(jour: :desc, updated_at: :desc)
    end

    def ajouter
      @compte_selectionne = Comptes::Compte.find_by_id params[:compte_id]
    end

    # def new
    # end

    def create
      parameters = format_params(transaction_params)

      @transaction = Transaction.new parameters
      @transaction.jour = ApplicationHelper::make_date params[:operation_date]

      if @transaction.save
        respond_to do |format|
          format.html { redirect_to @transaction }
          format.json do
            render json: { transaction: {
              id: @transaction.id,
              titre: @transaction.titre,
              somme: @transaction.somme.to_f / 100,
              compte: @transaction.compte.nom,
              date: @transaction.jour_formatte
            }}.to_json
          end
        end
      else
        respond_to do |format|
          format.html { render "new" }
          format.json { render json: { errors: @transaction.errors } }
        end
      end
    end

    def edit
    end

    def show
    end

    def update
    end

    def destroy
      @transaction = Comptes::Transaction.find_by_id(params[:id])
      if @transaction
        if @transaction.destroy
          flash[:notice] = "Transaction supprimée avec succés"
        else
          flash[:error] = "Impossible de supprimer la transaction"
        end
      else
        flash[:error] = "Transaction invalide. Aucune suppression."
      end

      redirect_to comptes_transactions_path
    end

    private
    def transaction_params
      params.require(:comptes_transaction).permit(:titre, :somme, :compte_id)
    end

    # Formate les parametres de la transaction
    # * convertit la somme en centimes
    def format_params parameters
      somme = parameters[:somme]
      parameters[:somme] = (somme.to_f * 100).to_i if ApplicationHelper::is_a_number? somme

      parameters
    end

  end

end
