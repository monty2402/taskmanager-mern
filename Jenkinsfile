pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "monteey/task-manager-frontend"
        BACKEND_IMAGE  = "monteey/task-manager-backend"

        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/monty2402/taskmanager-mern.git'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                echo "🐳 Building Frontend Image..."

                docker build \
                    -t $FRONTEND_IMAGE:$IMAGE_TAG \
                    ./frontend
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                echo "🐳 Building Backend Image..."

                docker build \
                    -t $BACKEND_IMAGE:$IMAGE_TAG \
                    ./backend
                """
            }
        }

        stage('Deploy with Docker Compose') {

            steps {

                script {

                    try {

                        sh """
                        echo "🚀 Deploying Full Stack Application..."

                        docker compose down || true

                        docker compose build

                        docker compose up -d
                        """

                        sh """
                        echo "⏳ Waiting for services..."
                        sleep 20
                        """

                        sh """
                        echo "🔍 Frontend Health Check..."
                        curl -f http://localhost:3000
                        """

                        sh """
                        echo "🔍 Backend Health Check..."
                        curl -f http://localhost:5000 || exit 1
                        """

                        echo "✅ Deployment Successful"

                    } catch (Exception e) {

                        echo "❌ Deployment Failed"

                        sh """
                        echo "📜 Docker Compose Logs:"
                        docker compose logs
                        """

                        error("Deployment failed")
                    }
                }
            }
        }
    }

    post {

        success {
            echo "✅ CI/CD Pipeline Completed Successfully"
        }

        failure {
            echo "❌ CI/CD Pipeline Failed"
        }

        always {
            echo "🧹 Cleaning unused Docker resources..."

            sh "docker system prune -f || true"
        }
    }
}
