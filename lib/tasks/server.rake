namespace :server do

  def rails_command args = {}
    command = "rails server"
    command << " --daemon" if args[:daemon]
    command << " -e #{args[:env]}" if args[:env]

    command
  end

  def rails_pid
    pid_path = File.join File.dirname(__FILE__), "..", "..", "tmp", 'pids', 'server.pid'
    if File.exists? pid_path
      File.read(pid_path).chomp
    else
      nil
    end
  end

  desc "Start rails as local server"
  task :start do
    exec rails_command
  end

  desc "Start rails as daemon"
  task :daemon do
    if system rails_command(daemon: true)
      puts "Rails server started as daemon [#{rails_pid}]"
    else
      STDERR.puts "Failed to start server as daemon"
    end
  end

  desc "Gets server daemon pid"
  task :pid do
    server_pid = rails_pid
    if server_pid
        puts "Server daemon: #{server_pid}"
    else
      puts "No daemon"
    end
  end

  desc "Stop a running rails daemon"
  task :stop do
    server_pid = rails_pid
    if server_pid
      if system "kill #{server_pid}"
        puts "Server daemon has stopped gracefully. Cheers!"
      else
        STDERR.puts "Failed to stop server daemon [#{server_pid}]"
      end
    else
      puts "No daemon to stop"
    end
  end

  desc "Restarts the server (as daemon)"
  task :restart => %W{
    server:stop
    server:daemon
  }

end