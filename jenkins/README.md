
# for jenkins agent

sudo groupadd jenkins

sudo useradd -m -d /home/jenkins -g jenkins jenkins

id jenkins / cat /etc/group  / cat /etc/passwd

 sudo su jenkins

 mkdir -p jenkins-agent


# for jenkins master

go to manage jenkins --> nodes --> new node

no of exectures
root directory path
label


usage : only build jobs with label expression matching this node

launch method : launch agent by connecting it to controller

availibity : keep this agent online as much as possible

save

go to the manage jenkins --> nodes

there is your created agent clikc on it and there is

curl -sO <JNLP_URL>

nohup java -jar agent.jar -jnlpUrl <JNLP_URL> -secret <SECRET> -name "<AGENT_NAME>" -webSocket -workDir "/home/jenkins/jenkins-agent" > agent.log 2>&1 &

run this on your jenkins agent 


now your jenkins agent it connected to jenkins master

scp -i "terra-key" /home/rahegaonkardatta/remote/E-Commerce-Web-App/terraform/terra-key ubuntu@54.194.191.110:/home/ubuntu