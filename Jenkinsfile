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
                docker build -t $IMAGE_NAME:$IMAGE_TAG ./frontend
                """
            }
        }

        stage('Deploy with Auto Rollback') {

            steps {

                script {

                    try {

                        sh """
                        echo "🚀 Deploying..."

                        docker rm -f $CONTAINER_NAME || true

                        docker run -d \
                            -p 3000:3000 \
                            --name $CONTAINER_NAME \
                            $IMAGE_NAME:$IMAGE_TAG
                        """

                        sh """
                        sleep 5
                        curl -f http://localhost:3000
                        """

                        sh """
                        echo "$IMAGE_NAME:$IMAGE_TAG" > $LAST_STABLE_FILE
                        """

                    } catch (Exception e) {

                        echo "Rollback started..."

                        def lastGood = sh(
                            script: "cat $LAST_STABLE_FILE",
                            returnStdout: true
                        ).trim()

                        sh """
                        docker rm -f $CONTAINER_NAME || true

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
}
