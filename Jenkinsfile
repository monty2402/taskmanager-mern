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

                echo "📜 Container logs:"
                sleep 5
                docker logs $CONTAINER_NAME || true
                """

                sh """
                echo "🔍 Health check..."
                sleep 5
                curl -f http://localhost:3000 || exit 1
                """

                sh """
                echo "$IMAGE_NAME:$IMAGE_TAG" > $LAST_STABLE_FILE
                echo "✅ Updated last stable image"
                """

            } catch (Exception e) {

                echo "❌ Deployment failed — attempting rollback..."

                def fileExists = sh(
                    script: "[ -f $LAST_STABLE_FILE ] && echo 'yes' || echo 'no'",
                    returnStdout: true
                ).trim()

                if (fileExists == "yes") {

                    def lastGood = sh(
                        script: "cat $LAST_STABLE_FILE",
                        returnStdout: true
                    ).trim()

                    echo "🔁 Restoring last stable image: ${lastGood}"

                    sh """
                    docker rm -f $CONTAINER_NAME || true

                    docker run -d \
                        -p 3000:3000 \
                        --name $CONTAINER_NAME \
                        $lastGood
                    """
                } else {
                    error("No rollback image available")
                }
            }
        }
    }
}