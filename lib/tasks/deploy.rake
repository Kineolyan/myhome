namespace :deploy do

  desc "Fetchs the branch to deploy"
  task :git, [:branch]  do |task, args|
    branch = args[:branch] || "master"

    fail "Impossible to fetch #{branch}" unless system("git fetch && git checkout #{branch} && git pull")
  end

  desc "Install the application"
  task :install do
    exec "bundle install"
  end

  desc "Update the database"
  task database: [ 'db:migrate' ]

  desc "Prepare assets"
  task assets: [ 'assets:precompile' ]

  desc "Deploy rails server"
  task deploy: [ :install, :database, :assets, 'server:stop', 'server:daemon' ]

end