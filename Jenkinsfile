pipeline { 
    agent any 
    stages { 
        stage ('Checkout') { 
            steps { 
                git branch:'master', url: 'https://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@github.com/zyue17/ICT3x03-D3-Analysis.git' 
            } 
        } 
         
        stage('Code Quality Check via SonarQube') { 
           steps { 
               script { 
                def scannerHome = tool 'SonarQube'; 
                   withSonarQubeEnv('SonarQube') { 
                   sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=OWSAP -Dsonar.sources=." 
                   } 
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
