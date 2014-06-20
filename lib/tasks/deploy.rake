namespace :deploy do

  task default: :all

  desc "Fetchs the branch to deploy [ [branch] ]"
  task :git, [:branch]  do |task, args|
    branch = args[:branch] || "master"

    fail "Impossible to fetch #{branch}" unless system("git checkout #{branch} && git pull --rebase")
  end

  desc "Update the database"
  task :database => [ 'db:migrate' ]

  desc "Prepare assets"
  task :assets => [ 'assets:precompile' ]

  desc "Deploy rails server"
  task :all => [ :git, :assets ] do
  end

end