pipeline {
    agent any

    environment {
        IMAGE_NAME = "monteey/task-manager-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        CONTAINER_NAME = "task-manager"
        LAST_STABLE_FILE = "last-stable-image.txt"
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

        

        stage('Deploy with Auto Rollback') {
            steps {
                script {
                    try {
                        sh """
                        echo "🚀 Deploying new container..."

                        docker rm -f $CONTAINER_NAME || true

                        docker run -d \
                            -p 3000:3000 \
                            --name $CONTAINER_NAME \
                            $IMAGE_NAME:$IMAGE_TAG
                        """

                        // Health check (critical safety gate)
                        sh """
                        echo "🔍 Health check..."
                        sleep 5
                        curl -f http://localhost:3000/health
                        """

                        // Save stable version
                        sh """
                        echo "$IMAGE_NAME:$IMAGE_TAG" > $LAST_STABLE_FILE
                        echo "✅ Updated last stable image"
                        """

                    } catch (Exception e) {

                        echo "❌ Deployment failed — rolling back..."

                        def lastGood = sh(script: "cat $LAST_STABLE_FILE", returnStdout: true).trim()

                        sh """
                        docker rm -f $CONTAINER_NAME || true

                        echo "🔁 Restoring last stable image: $lastGood"

                        docker run -d \
                            -p 3000:3000 \
                            --name $CONTAINER_NAME \
                            $lastGood
                        """
                    }
                }
            }
        }
    }

    post {

        success {
            echo "✅ Deployment SUCCESS — system healthy"
        }

        failure {
            echo "❌ Deployment FAILED — rollback executed if needed"
        }

        always {
            echo "🧹 Cleaning unused Docker resources..."
            sh "docker system prune -f || true"
        }
    }
}