pipeline {
    agent any

    environment {
        IMAGE_NAME = "monteey/task-manager-frontend"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        LAST_GOOD_IMAGE = "task-manager-last-good"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/monty2402/taskmanager-mern.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        sh """
                        docker build -t $IMAGE_NAME:$IMAGE_TAG ./frontend
                        docker tag $IMAGE_NAME:$IMAGE_TAG $LAST_GOOD_IMAGE
                        """
                    } catch (err) {
                        echo "❌ Build failed. Will try rollback deploy."
                        error "Stopping pipeline due to build failure"
                    }
                }
            }
        }

    }

    post {
        success {
            echo "✅ Pipeline SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED (rollback attempted if needed)"
        }
    }
}