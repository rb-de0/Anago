up:
	docker-compose up -d

db:
	docker-compose up -d mongo

attach_mongo:
	docker exec -it anago_mongo /bin/bash

down:
	docker-compose down

clean:
	rm -rf .mongo/*

run:
	docker-compose down
	docker-compose up -d

status: 
	docker-compose ps

log:
	docker-compose logs
