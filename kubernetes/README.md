kubernetes deployment:

install kind, kubectl, metrics-server

create namespace ecommerce
create pv, pvc, mongo-deployment
using kubectl apply -f .

to cheack the mongodb 

kubectl get pods -n namespcae

kubectl exec -it pod-name -n namespace -- bash
and inside this run
mongosh -u root -p root123 --authenticationDatabase admin

then go for mongo-service


then create a bakcend-deployemnt