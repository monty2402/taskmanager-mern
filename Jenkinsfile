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
                git branch: 'feature', url: 'https://github.com/monty2402/taskmanager-mern.git'
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
                        echo "🔍 Running SonarQube Analysis..."

                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=taskmanager-mern \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.token=sqa_906aa3f2b00c9c0bc546e39785e8465c1e84b13b
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

        stage('Push Docker Images') {
            steps {

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh """
                    echo "🔐 Logging into DockerHub..."

                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    echo "📤 Pushing Frontend Image..."
                    docker push $FRONTEND_IMAGE:$IMAGE_TAG

                    echo "📤 Pushing Backend Image..."
                    docker push $BACKEND_IMAGE:$IMAGE_TAG
                    """
                }
            }
        }

        stage('Debug Files') {
            steps {
                sh """
                echo "📂 Current Workspace:"
                pwd

                echo "📂 Files:"
                ls -la

                echo "📜 Staging Compose File:"
                cat docker-compose.staging.yml
                """
            }
        }

        stage('Deploy Staging with Auto Rollback') {

            steps {

                script {

                    try {

                        sh """
                        echo "🚀 Deploying staging environment..."

                        docker compose -f docker-compose.staging.yml down || true

                        docker compose -f docker-compose.staging.yml pull || true

                        docker compose -f docker-compose.staging.yml up -d

                        echo "⏳ Waiting for services..."
                        sleep 20

                        echo "🔍 Health Checking Frontend..."

                        curl -f http://localhost:3001 || exit 1

                        echo "✅ Deployment Successful"

                        echo "$IMAGE_TAG" > last-stable.txt
                        """

                    } catch (Exception e) {

                        echo "❌ Deployment Failed"

                        sh """
                        echo "📜 Docker Logs:"
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

                            echo "🔁 Rolling Back To Stable Version: ${lastStable}"

                            sh """
                            docker compose -f docker-compose.staging.yml down || true

                            docker pull $FRONTEND_IMAGE:${lastStable} || true
                            docker pull $BACKEND_IMAGE:${lastStable} || true

                            docker compose -f docker-compose.staging.yml up -d
                            """
                        }

                        error("❌ Deployment Failed")
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

            sh """
            echo "🧹 Cleaning Docker Resources..."

            docker image prune -f || true
            """
        }
    }
}