pipeline {
    agent any

    environment {
        IMAGE_NAME = "monteey/task-manager-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        CONTAINER_NAME = "task-manager"
        LAST_GOOD_IMAGE = "task-manager-last-good"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/monty2402/taskmanager-mern.git'
            }
        }

        stage('Trivy FS Scan (Pre-Build Security)') {
            steps {
                sh """
                echo "🔍 Running FS scan with Trivy (containerized)..."
                docker run --rm \
                    -v $PWD:/project \
                    aquasec/trivy fs /project/frontend \
                    --severity CRITICAL,HIGH \
                    --exit-code 1
                """
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

        stage('Trivy Image Scan (Post-Build Security)') {
            steps {
                sh """
                echo "🔍 Running Image scan with Trivy (containerized)..."
                docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy image \
                    $IMAGE_NAME:$IMAGE_TAG \
                    --severity CRITICAL \
                    --exit-code 1
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

                    # Mark this as last good image
                    docker tag $IMAGE_NAME:$IMAGE_TAG $LAST_GOOD_IMAGE
                    """
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    try {
                        sh """
                        echo "🚀 Deploying new container..."
                        docker rm -f $CONTAINER_NAME || true
                        docker run -d -p 3000:3000 \
                            --name $CONTAINER_NAME \
                            $IMAGE_NAME:$IMAGE_TAG
                        """
                    } catch (err) {
                        echo "⚠️ Deployment failed. Rolling back..."

                        sh """
                        docker rm -f $CONTAINER_NAME || true
                        docker run -d -p 3000:3000 \
                            --name $CONTAINER_NAME \
                            $LAST_GOOD_IMAGE
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED (rollback executed if needed)"
        }
    }
}