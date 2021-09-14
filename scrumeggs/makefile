.ONESHELL:

.PHONY: clean install run_backend run_frontend

clean:
	find . -type f -name '*.pyc' -delete
	find . -type f -name '*.log' -delete

install:
	pip3 install -r requirements.txt
	cd ./Frontend
	npm install 

run_backend:
	cd ./Backend-Praetorian && python3 api.py &

run_frontend:	
	cd ./Frontend && npm start 
