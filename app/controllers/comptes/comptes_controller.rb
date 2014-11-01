module Comptes

  class ComptesController < ApplicationController
    before_action :get_compte, [:show, :edit, :udpate, :solde, :summary]

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
      @transactions = @compte.transactions.order(jour: :desc, created_at: :desc).limit(5) if @compte
    end

    def edit
    end

    def update
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

    def solde
      if request.post?
        if @compte && ApplicationHelper::is_a_date?(params[:date])
          @date = Date.parse params[:date]
          @solde = ComptesHelper.format_amount @compte.solde(until: @date), true
        end
      end
    end

    def summary
      return unless @compte

      now = Date.today
      current_month = Date.new now.year, now.month

      @previous_months = []
      12.times do |i|
        month_beginning = current_month << i
        next_month = month_beginning >> 1

        solde = @compte.solde(before: next_month, with_currency: false)
        debit = get_changing_trades(@compte, month_beginning, next_month){ |transactions| transactions.where("somme < 0") }.abs
        credit = get_changing_trades(@compte, month_beginning, next_month){ |transactions| transactions.where("somme > 0") }

        month_data = {
          date: month_beginning,
          solde: solde,
          debit: ComptesHelper.decode_amount(-debit),
          credit: ComptesHelper.decode_amount(credit),
          expense: ComptesHelper.decode_amount(credit - debit)
        }
        @previous_months << month_data
      end
    end

    private
      def comptes_params
        params.require(:comptes_compte).permit(:nom, :solde_historique)
      end

      def format_params parameters
        solde_historique = parameters[:solde_historique]
        parameters[:solde_historique] = ComptesHelper.encode_amount solde_historique if ApplicationHelper.is_a_number? solde_historique

        parameters
      end

      def get_compte
        @compte = Compte.find_by_id params[:id]
      end

      # Get the trades that affect the solde of the account
      # Params
      #   account account to consider
      #   from initial datetime (included)
      #   to ending datetime ()
      # Returns the appropriate transactions
      def get_changing_trades account, from, to, &conditions
        all_trades = account.transactions.since(from).before(to)
        total = conditions.call(all_trades).sum(:somme)
        total_monnaie = conditions.call(all_trades.where(type: TransactionMonnaie)).sum(:somme)

        total - total_monnaie
      end
  end

end # module Comptes