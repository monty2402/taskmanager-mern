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

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "dockerhub-creds",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo "🔐 Logging into Docker Hub..."
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                    echo "📦 Pushing image..."
                    docker push $IMAGE_NAME:$IMAGE_TAG
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                echo "🚀 Deploying container..."

                # Stop and remove old container
                docker rm -f $CONTAINER_NAME || true

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