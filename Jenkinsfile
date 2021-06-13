pipeline {
  agent {
    docker {
      image 'ubuntu'
      label 'docker'
    }
  }
  stages {
    stage('Ping') {
      steps {
        sh 'echo Ping'
      }
    }
  }
}