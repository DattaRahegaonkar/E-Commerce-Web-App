
# Adding a Jenkins Agent Node via SSH

This guide explains how to add a new agent node to a Jenkins master using SSH for secure communication.

## Prerequisites

- Jenkins master server running
- SSH access to the agent node
- SSH key pair for authentication

## Steps to Add a Jenkins Agent Node

### 1. Access Jenkins Dashboard

Navigate to your Jenkins web interface.

### 2. Create New Node

1. Go to **Manage Jenkins** > **Nodes** > **New Node**
2. Enter a **Name** for the node (e.g., `agent-node-1`)
3. Select **Permanent Agent** and click **OK**

### 3. Configure Node Settings

Fill in the following configuration details:

- **Number of executors**: Set the number of concurrent builds this node can handle (e.g., 2)
- **Remote root directory**: Specify the working directory on the agent (e.g., `/home/jenkins/agent`)
- **Labels**: Add descriptive labels for the node (e.g., `linux docker`)

### 4. Set Launch Method

- Select **Launch agents via SSH**
- Enter the **Host** field with the IP address or hostname of the agent node

### 5. Add SSH Credentials

1. Click **Add** next to the Credentials dropdown
2. Select **SSH Username with private key**
3. Enter the username for SSH connection (e.g., `jenkins`)
4. Choose **Enter directly** and paste the private key
5. Optionally, add a passphrase if the key is encrypted
6. Click **Add** to save the credentials

### 6. Generate SSH Key Pair

To generate the SSH key pair on the agent node:

1. SSH into the agent node:
   ```bash
   ssh user@agent-node-ip
   ```

2. Generate the SSH key pair:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "jenkins-agent"
   ```
   - Press Enter to accept default location

3. Copy the public key to authorized keys:
   ```bash
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   ```

4. Secure the authorized_keys file:
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   ```

5. Copy the private key content (from `~/.ssh/id_rsa`) to use in Jenkins credentials

### 7. Save and Launch Agent

1. Click **Save** to create the node configuration
2. Jenkins will attempt to launch the agent automatically
3. Monitor the node status in the Nodes page - it should show as "Online" when successfully connected

## Troubleshooting

- Ensure SSH service is running on the agent node
- Verify firewall rules allow SSH connections (port 22)
- Check that the Jenkins user has proper permissions on the agent
- Review Jenkins logs for connection errors

## Additional Notes

- The agent will automatically reconnect if the connection is lost
- You can configure advanced options like environment variables and tool locations in the node configuration
- For production setups, consider using SSH jump hosts or VPNs for enhanced security

