apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: eks-cluster
  region: eu-west-1

vpc:
  id: ${vpc_id}

  subnets:
    public:
      eu-west-1a:
        id: ${public_subnet_1a_id}

      eu-west-1b:
        id: ${public_subnet_1b_id}

    private:
      eu-west-1a:
        id: ${private_subnet_1a_id}

      eu-west-1b:
        id: ${private_subnet_1b_id}

iam:
  withOIDC: true

  serviceAccounts:
    - metadata:
        name: secret-manager-sa
        namespace: ecommerce

      attachPolicyARNs:
        - arn:aws:iam::${account_id}:policy/secrets-policy

      roleName: secrets-role


managedNodeGroups:
  - name: ng-1

    instanceType: c7i-flex.large

    desiredCapacity: 2
    minSize: 1
    maxSize: 3

    privateNetworking: true


addons:
  - name: eks-pod-identity-agent

  - name: aws-secrets-store-csi-driver-provider

  - name: aws-ebs-csi-driver
    attachPolicyARNs:
      - arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy
