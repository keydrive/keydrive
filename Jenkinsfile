pipeline {
  agent {
    docker {
      image 'ubuntu'
      label 'docker'
    }
  }
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t chappio/clearcloud:${env.BUILD_TAG} .'
      }
    }
  }
}