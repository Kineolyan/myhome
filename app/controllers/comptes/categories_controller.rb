class Comptes::CategoriesController < ApplicationController
  before_action :set_comptes_category, only: [:show, :edit, :update, :destroy]

  # GET /comptes/categories
  # GET /comptes/categories.json
  def index
    @comptes_categories = Comptes::Categorie.order(nom: :asc)
  end

  # GET /comptes/categories/1
  # GET /comptes/categories/1.json
  def show
  end

  # GET /comptes/categories/new
  def new
    @comptes_category = Comptes::Categorie.new
  end

  # GET /comptes/categories/1/edit
  def edit
  end

  # POST /comptes/categories
  # POST /comptes/categories.json
  def create
    @comptes_category = Comptes::Categorie.new(comptes_category_params)

    respond_to do |format|
      if @comptes_category.save
        format.html { redirect_to @comptes_category, notice: 'Categorie was successfully created.' }
        format.json { render action: 'show', status: :created, location: @comptes_category }
      else
        format.html { render action: 'new' }
        format.json { render json: @comptes_category.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /comptes/categories/1
  # PATCH/PUT /comptes/categories/1.json
  def update
    respond_to do |format|
      if @comptes_category.update(comptes_category_params)
        format.html { redirect_to @comptes_category, notice: 'Categorie was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @comptes_category.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /comptes/categories/1
  # DELETE /comptes/categories/1.json
  def destroy
    @comptes_category.destroy
    respond_to do |format|
      format.html { redirect_to comptes_categories_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_comptes_category
      @comptes_category = Comptes::Categorie.find_by_id(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def comptes_category_params
      params.require(:comptes_categorie).permit(:nom)
    end
end
