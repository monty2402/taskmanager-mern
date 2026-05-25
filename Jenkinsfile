pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "monteey/task-manager-frontend"
        BACKEND_IMAGE  = "monteey/task-manager-backend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        SONAR_HOST = "http://localhost:9000"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/monty2402/taskmanager-mern.git'
            }
        }

        // stage('Ensure SonarQube Running') {
        //     steps {
        //         sh '''
        //         echo "🔍 Checking SonarQube..."

        //         if ! docker ps | grep -q sonarqube; then
        //             echo "🚀 Starting SonarQube..."
        //             docker compose up -d sonarqube postgres
        //             sleep 40
        //         else
        //             echo "✅ SonarQube already running"
        //         fi

        //         echo "🔎 Checking API..."
        //         curl -f http://localhost:9000/api/system/status || exit 1
        //         '''
        //     }
        // }

        // stage('SonarQube Analysis') {
        //     steps {
        //         script {

        //             def scannerHome = tool 'sonar-scanner'

        //             sh """
        //             echo "🔍 Checking SonarQube health..."

        //             STATUS=\$(curl -s ${SONAR_HOST}/api/system/status | grep -o 'UP' || true)

        //             if [ "\$STATUS" != "UP" ]; then
        //                 echo "⚠️ SonarQube not healthy. Restarting..."

        //                 docker compose down -v || true
        //                 docker compose up -d

        //                 echo "⏳ Waiting for SonarQube..."

        //                 for i in \$(seq 1 30); do
        //                     STATUS=\$(curl -s ${SONAR_HOST}/api/system/status | grep -o 'UP' || true)
        //                     if [ "\$STATUS" = "UP" ]; then
        //                         echo "✅ SonarQube is UP"
        //                         break
        //                     fi
        //                     sleep 10
        //                 done
        //             fi
        //             """

        //             withSonarQubeEnv('sonarqube') {
        //                 sh """
        //                 echo "🚀 Running Sonar Scanner..."

        //                 ${scannerHome}/bin/sonar-scanner \
        //                 -Dsonar.projectKey=taskmanager-mern \
        //                 -Dsonar.sources=. \
        //                 -Dsonar.host.url=${SONAR_HOST} \
        //                 -Dsonar.login=squ_c487cc48984f810bb95fe0cceb293760cf5b5e2a
        //                 """
        //             }
        //         }
        //     }
        // }

        stage('Trivy Filesystem Scan') {
            steps {
                script {
                    sh '''
                    docker run --rm \
                      -v $(pwd):/workspace \
                      -w /workspace \
                      aquasec/trivy:latest fs . \
                      --severity CRITICAL \
                      --exit-code 1 \
                      --no-progress
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                echo "🐳 Building Frontend Image..."
                docker build -t $FRONTEND_IMAGE:$IMAGE_TAG ./frontend
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                echo "🐳 Building Backend Image..."
                docker build -t $BACKEND_IMAGE:$IMAGE_TAG ./backend
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
                --severity CRITICAL \
                --exit-code 1 \
                --no-progress \
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
                --severity CRITICAL \
                --exit-code 1 \
                --no-progress \
                ${BACKEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Docker Login Verify') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "🔐 Docker Login..."

                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                    docker info | grep Username || true
                    '''
                }
            }
        }

        stage('Deploy with Auto Rollback') {
            steps {
                script {
                    try {
                        sh """
                        echo "🚀 Deploying..."

                        docker compose down || true
                        docker compose up -d --build

                        sleep 15

                        echo "🔍 Health Check..."
                        curl -f http://localhost:3000 || exit 1

                        echo "$IMAGE_TAG" > last-stable.txt
                        """
                    }
                    catch (Exception e) {

                        echo "❌ Deployment failed, starting rollback"

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

                            echo "🔁 Rolling back to: ${lastStable}"

                            sh """
                            docker compose down || true
                            docker tag ${BACKEND_IMAGE}:${lastStable} ${BACKEND_IMAGE}:latest
                            docker tag ${FRONTEND_IMAGE}:${lastStable} ${FRONTEND_IMAGE}:latest
                            docker compose up -d
                            """
                        }

                        error("Deployment failed after rollback attempt")
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
            echo "🧹 Cleaning Docker..."
            sh "docker system prune -f || true"
        }
    }
}