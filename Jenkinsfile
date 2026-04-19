pipeline {
    agent any

    environment {
        IMAGE_NAME = "monteey/task-manager-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        CONTAINER_NAME = "task-manager"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/monty2402/taskmanager-mern.git'
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                echo "🐳 Building Docker image..."
                docker build -t $IMAGE_NAME:$IMAGE_TAG ./frontend
                """
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                echo "🚀 Deploying container..."

                # Run new container
                docker run -d -p 3000:3000 \
                    --name $CONTAINER_NAME \
                    $IMAGE_NAME:$IMAGE_TAG
                """
            }
        }
    }

    post {
        success {
            echo "✅ Deployment SUCCESS"
        }
        failure {
            echo "❌ Deployment FAILED"
        }
    }
}