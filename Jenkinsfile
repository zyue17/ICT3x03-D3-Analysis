pipeline {
	agent any
	stage ('Checkout'){
		steps{
			git branch:'master', url:'https://github.com/zyue17/ICT3x03-D3-Analysis.git'
		}
	}
	stage('Code Quality Check via SonarQube'){
		steps {
			script {
				def scannerHome = tool 'SonarQube';
				withSonarQubeEnv('SonarQube'){
					sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=OWASP -Dsonar.sources=."
				}
			}
		}
	}
	post {
		always {
			recordIssues enabledForFailure: true, tool: sonarQube()
		}
	}
}
