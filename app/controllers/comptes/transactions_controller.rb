module Comptes

  class TransactionsController < ApplicationController
    def index
    end

    def create
    end

    def new
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
  end

end
