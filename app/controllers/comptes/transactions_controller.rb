module Comptes

  class TransactionsController < ApplicationController
    def index
    end

    def ajouter
      # nothing to do
    end

    # def new
    # end

    def create
      @transaction = Transaction.new transaction_params
      @transaction.jour = ApplicationHelper::make_date params[:operation_date]
      logger.debug "Olivier #{@transaction.jour.class} #{@transaction.jour}"

      if @transaction.save
        logger.debug "Olivier -> transaction saved"
        respond_to do |format|
          format.html { redirect_to @transaction }
          format.json do
            render json: { transaction: {
              id: @transaction.id,
              titre: @transaction.titre,
              somme: @transaction.somme,
              compte: @transaction.compte.nom,
              date: @transaction.jour.strftime("%d/%m/%Y")
            }}.to_json
          end
        end
      else
        logger.debug "Olivier -> transaction fails\n#{@transaction.errors.inspect}"
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

    def liste
      @transactions = Transaction.all
    end

    private
    def transaction_params
      params.require(:comptes_transaction).permit(:titre, :somme, :compte_id)
    end
  end

end
