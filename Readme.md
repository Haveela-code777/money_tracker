# Money Tracker
## Configuration Process

## Backend:

#### First Please Install Python, Python Environment and try to install all the requirements from requirements.txt 

## 1: Create Virual Environment and Activate
    py -m venv money_tracker_env
    money_tracker_env\Scripts\activate.bat 

##### If unable to activate using above command, go to directory money_tracker_env\Scripts and enter
    ./activate.bat

## 2: Install Dependencies
    pip install -r requirements.txt

## 3: Update Model Migrations and DB
    python manage.py makemigrations
    python manage.py migrate

## 4: Run Server 
    python manage.py runserver

#### By Default server will be running in 8000 port. Server URL : "http://localhost:8000"

## Frontend:

#### First Please Download and Install NodeJS Stable version

## 1: Create a New React App
    npx create-react-app money_tracker_frontend

## 2: Install Dependencies
    npm install

## 3: Run Server 
    npm start

#### By Default server will be running in 3000 port. Server URL : "http://localhost:3000"

## Go To http://localhost:3000