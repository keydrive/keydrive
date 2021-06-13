pipeline {
  agent {
    docker {
      image 'ubuntu'
      label 'docker'
    }
  }
  stages {
    stage('Ping') {
      sh 'echo Ping'
    }
  }
}