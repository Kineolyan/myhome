Myhome::Application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".
  root 'home#welcome'

  namespace :comptes do
    get "/" => "transactions#index"

    concern :with_transactions do |options|
      resources :transactions, options do
        collection do
          get "ajouter"
        end
      end
    end

    concerns :with_transactions
    resources :transaction_monnaies, controller: "transactions"
    resources :transaction_cartes, controller: "transactions"
    resources :transfers, controller: "transactions"

    resources :comptes, concerns: [ :with_transactions ] do
      member do
        get :solde
        post :solde
        get :summary
        get :statistics
      end
    end

    resources :categories
  end

  namespace :date_marker do
    resources :events do
      member do
        get :get_day
        post :get_day
      end
    end
  end

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
