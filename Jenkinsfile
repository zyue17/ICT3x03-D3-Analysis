pipeline {
	agent {
        docker {
            image 'node:lts-buster-slim' 
            args '-p 3000:3000' 
        }
    }
	environment {
        CI = 'true' 
    	}
    stages {
	stage('OWASP DependencyCheck') {
			tools {
                   		jdk "jdk-11"
                	}
			steps {
				echo 'DependencyCheck'
				dependencyCheck additionalArguments: '--format HTML --format XML --suppression suppression.xml', odcInstallation: 'Default'
			}
		}
        stage('Build') {
            steps {
                echo 'Building..'
		sh 'cd front_end && npm install'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
		sh "chmod +x -R ${env.WORKSPACE}"
		sh './jenkins/scripts/test.sh'
            }
        }
        stage('Deploy') {
            steps  {
                echo 'Deploying....'
		sh './jenkins/scripts/deliver.sh' 
                input message: 'Finished using the web site? (Click "Proceed" to continue)' 
                sh './jenkins/scripts/kill.sh'
            }
        }
    }
	post {
		success {
			dependencyCheckPublisher pattern: 'dependency-check-report.xml'
		}

	}
}