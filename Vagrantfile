Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vagrant.plugins = "vagrant-docker-compose"
  config.vagrant.plugins = "vagrant-vbguest"

  config.vm.provision :docker
  config.vm.provision :docker_compose

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048
    vb.cpus = 1
  end

  config.vm.provision "shell", inline: "apt install -y make"
  config.vm.synced_folder ".", "/home/vagrant/app", owner: "vagrant", group: "vagrant"
end