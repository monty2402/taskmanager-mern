pipeline {
agent any

```
environment {
    FRONTEND_IMAGE = "monteey/task-manager-frontend"
    BACKEND_IMAGE  = "monteey/task-manager-backend"
    IMAGE_TAG      = "v${BUILD_NUMBER}"
    SONAR_HOST     = "http://localhost:9000"
}

stages {

    stage('Checkout Code') {
        steps {
            git branch: 'main',
                url: 'https://github.com/monty2402/taskmanager-mern.git'
        }
    }

    stage('SonarQube Analysis') {
        steps {
            script {

                def scannerHome = tool 'sonar-scanner'

                withCredentials([
                    string(
                        credentialsId: 'sonar-token',
                        variable: 'SONAR_TOKEN'
                    )
                ]) {

                    withSonarQubeEnv('sonarqube') {

                        sh """
                        echo "🚀 Running SonarQube Analysis..."

                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=taskmanager-mern \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONAR_HOST} \
                          -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }
    }

    stage('Trivy Filesystem Scan') {
        steps {
            sh """
            echo "🔍 Running Trivy Filesystem Scan..."

            docker run --rm \
              -v \$(pwd):/workspace \
              -w /workspace \
              aquasec/trivy:latest fs \
              --severity HIGH,CRITICAL \
              --exit-code 0 \
              .
            """
        }
    }

    stage('Build Frontend Image') {
        steps {
            sh """
            echo "🐳 Building Frontend Image..."

            docker build \
              -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
              ./frontend
            """
        }
    }

    stage('Build Backend Image') {
        steps {
            sh """
            echo "🐳 Building Backend Image..."

            docker build \
              -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
              ./backend
            """
        }
    }

    stage('Verify Images') {
        steps {
            sh """
            echo "📦 Verifying Docker Images..."

            docker images | grep task-manager-frontend || true
            docker images | grep task-manager-backend || true

            echo "FRONTEND_IMAGE=${FRONTEND_IMAGE}"
            echo "BACKEND_IMAGE=${BACKEND_IMAGE}"
            echo "IMAGE_TAG=${IMAGE_TAG}"
            """
        }
    }

    stage('Trivy Frontend Image Scan') {
        steps {
            sh """
            echo "🔍 Scanning Frontend Docker Image..."

            docker run --rm \
              -v /var/run/docker.sock:/var/run/docker.sock \
              aquasec/trivy:latest image \
              --severity HIGH,CRITICAL \
              --exit-code 0 \
              ${FRONTEND_IMAGE}:${IMAGE_TAG}
            """
        }
    }

    stage('Trivy Backend Image Scan') {
        steps {
            sh """
            echo "🔍 Scanning Backend Docker Image..."

            docker run --rm \
              -v /var/run/docker.sock:/var/run/docker.sock \
              aquasec/trivy:latest image \
              --severity HIGH,CRITICAL \
              --exit-code 0 \
              ${BACKEND_IMAGE}:${IMAGE_TAG}
            """
        }
    }

    stage('Docker Login') {
        steps {

            withCredentials([
                usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )
            ]) {

                sh """
                echo "🔐 Logging into Docker Hub..."

                echo "${DOCKER_PASS}" | docker login \
                -u "${DOCKER_USER}" \
                --password-stdin
                """
            }
        }
    }

    stage('Push Images') {
        steps {

            sh """
            echo "📤 Pushing Frontend Image..."
            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}

            echo "📤 Pushing Backend Image..."
            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
            """
        }
    }

    stage('Deploy with Auto Rollback') {

        steps {

            script {

                try {

                    sh """
                    echo "🚀 Deploying Application..."

                    docker compose down || true
                    docker compose up -d

                    echo "⏳ Waiting for containers..."
                    sleep 20

                    echo "🩺 Running Health Check..."

                    curl -f http://localhost:3000

                    echo "${IMAGE_TAG}" > last-stable.txt

                    echo "✅ Deployment Successful"
                    """

                } catch (Exception e) {

                    echo "❌ Deployment Failed"
                    echo "🔁 Starting Rollback"

                    sh "docker compose logs || true"

                    def stableExists = sh(
                        script: '[ -f last-stable.txt ] && echo yes || echo no',
                        returnStdout: true
                    ).trim()

                    if (stableExists == "yes") {

                        def lastStable = sh(
                            script: 'cat last-stable.txt',
                            returnStdout: true
                        ).trim()

                        echo "Rolling Back To ${lastStable}"

                        sh """
                        docker compose down || true

                        docker tag \
                        ${FRONTEND_IMAGE}:${lastStable} \
                        ${FRONTEND_IMAGE}:latest

                        docker tag \
                        ${BACKEND_IMAGE}:${lastStable} \
                        ${BACKEND_IMAGE}:latest

                        docker compose up -d
                        """
                    }

                    error("Deployment Failed After Rollback")
                }
            }
        }
    }
}

post {

    success {
        echo "✅ Pipeline Completed Successfully"
    }

    failure {
        echo "❌ Pipeline Failed"
    }

    always {

        sh """
        echo "🧹 Cleaning Docker Resources..."
        docker system prune -f || true
        """
    }
}
```

}
