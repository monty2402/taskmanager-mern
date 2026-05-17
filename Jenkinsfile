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

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonarqube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=taskmanager-mern \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.login=squ_c487cc48984f810bb95fe0cceb293760cf5b5e2a
                        """
                    }
                }
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

        stage('Deploy with Auto Rollback') {
            steps {
                script {

                    try {

                        sh """
                        echo "🚀 Stopping old containers..."

                        docker compose -f docker-compose.staging.yml down || true

                        echo "🚀 Starting new deployment..."

                        docker compose -f docker-compose.staging.yml up -d --build

                        echo "⏳ Waiting for services..."
                        sleep 15

                        echo "🔍 Health check..."

                        curl -f http://localhost:3000 || exit 1

                        echo "✅ Deployment successful"

                        echo "$IMAGE_TAG" > last-stable.txt
                        """

                    } catch (Exception e) {

                        echo "❌ Deployment failed"

                        sh """
                        echo "📜 Docker Compose Logs:"
                        docker compose -f docker-compose.staging.yml logs
                        """

                        def stableExists = sh(
                            script: '[ -f last-stable.txt ] && echo yes || echo no',
                            returnStdout: true
                        ).trim()

                        if (stableExists == "yes") {

                            def lastStable = sh(
                                script: 'cat last-stable.txt',
                                returnStdout: true
                            ).trim()

                            echo "🔁 Rolling back to stable version: ${lastStable}"

                            sh """
                            docker compose -f docker-compose.staging.yml down || true

                            docker image tag monteey/task-manager-frontend:${lastStable} monteey/task-manager-frontend:latest

                            docker compose -f docker-compose.staging.yml up -d
                            """
                        }

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