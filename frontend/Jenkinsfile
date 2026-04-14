pipeline {
    agent any

    environment {
        IMAGE_NAME = "monteey/task-manager-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        DOCKER_CREDENTIALS = "dockerhub-creds"
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh """
                docker run -d --name frontend -p 3000:3000 ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        success {
            echo "✅ Build + Push + Deploy SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}