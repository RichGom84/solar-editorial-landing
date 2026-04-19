// robot-script.js
document.addEventListener('DOMContentLoaded', function() {
  // 필요한 요소들 선택
  const botBody = document.getElementById('bot-body');
  const botHead = document.querySelector('.bot-head');
  const leftEar = document.querySelector('.left-ear');
  const rightEar = document.querySelector('.right-ear');
  const leftEye = document.querySelector('.left-eye');
  const rightEye = document.querySelector('.right-eye');
  const leftPupil = document.querySelector('.left-eye .bot-pupil');
  const rightPupil = document.querySelector('.right-eye .bot-pupil');
  const leftEyelid = document.querySelector('.left-eye .bot-eyelid');
  const rightEyelid = document.querySelector('.right-eye .bot-eyelid');
  
  // 화면 중앙 좌표 계산
  let centerX = window.innerWidth / 2;
  let centerY = window.innerHeight / 2;
  
  // 마우스 이벤트 리스너
  document.addEventListener('mousemove', (e) => {
    updateBotExpression(e.clientX, e.clientY);
  });
  
  // 모바일 터치 지원
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateBotExpression(touch.clientX, touch.clientY);
  }, { passive: false });
  
  // 화면 크기 변경 감지
  window.addEventListener('resize', () => {
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight / 2;
  });
  
  // 봇 표정 업데이트 함수
  function updateBotExpression(mouseX, mouseY) {
    // 봇 컨테이너의 위치 가져오기
    const rect = botBody.getBoundingClientRect();
    const botCenterX = rect.left + rect.width / 2;
    const botCenterY = rect.top + rect.height / 2;
    
    // 마우스와 봇 중심 사이의 각도 계산
    const angleX = (mouseX - botCenterX) / (window.innerWidth / 2) * 20;
    const angleY = (mouseY - botCenterY) / (window.innerHeight / 2) * 15;
    
    // 전체 머리에 약간의 3D 회전 효과 추가 (입체감을 위해)
    botHead.style.transform = `rotateY(${-angleX * 0.15}deg) rotateX(${angleY * 0.1}deg)`;
    
    // 눈 이동 범위 계산 (원 안에서만 움직이도록 제한)
    const maxEyeMove = 12; // 최대 이동 범위
    const eyeX = (mouseX - botCenterX) / window.innerWidth * maxEyeMove * 3;
    const eyeY = (mouseY - botCenterY) / window.innerHeight * maxEyeMove * 3;
    
    // 눈의 위치를 개별적으로 제어
    leftEye.style.transform = `translateX(${eyeX * 0.7}px) translateY(${eyeY * 0.7}px)`;
    rightEye.style.transform = `translateX(${eyeX * 0.7}px) translateY(${eyeY * 0.7}px)`;
    
    // 눈동자 움직임 (더 좁은 범위로 수정)
    const pupilX = eyeX * 0.5;
    const pupilY = eyeY * 0.5;
    
    // 눈동자 위치 업데이트
    leftPupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    rightPupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
    
    // 귀 위치 조정 - 마우스 방향에 따라 보이거나 숨기기
    if (angleX > 0) {
      // 마우스가 오른쪽에 있을 때
      leftEar.style.transform = `translateY(-50%) translateZ(-5px) translateX(${-angleX * 0.5}px)`;
      rightEar.style.transform = `translateY(-50%) translateZ(-5px) translateX(${-angleX * 0.2}px)`;
      leftEar.style.opacity = 1;
      rightEar.style.opacity = 0.5 - angleX / 40;
    } else {
      // 마우스가 왼쪽에 있을 때
      leftEar.style.transform = `translateY(-50%) translateZ(-5px) translateX(${-angleX * 0.2}px)`;
      rightEar.style.transform = `translateY(-50%) translateZ(-5px) translateX(${-angleX * 0.5}px)`;
      leftEar.style.opacity = 0.5 + angleX / 40;
      rightEar.style.opacity = 1;
    }
  }
  
  // 눈 깜빡임 간격 랜덤화
  function randomizeBlinking() {
    // 간격을 랜덤으로 설정
    const randomDelay = Math.random() * 3 + 2; // 2-5초 사이
    
    // 깜빡임 시간 조정
    leftEyelid.style.animationDuration = `${randomDelay}s`;
    rightEyelid.style.animationDuration = `${randomDelay + 0.1}s`;
    
    // 약간의 지연 효과
    rightEyelid.style.animationDelay = '0.1s';
    
    // 다음 깜빡임 예약
    setTimeout(randomizeBlinking, randomDelay * 1000);
  }
  
  // 초기화 함수
  function init() {
    randomizeBlinking();
    
    // 초기 위치 설정 (화면 중앙 가정)
    updateBotExpression(centerX, centerY);
  }
  
  // 초기화 실행
  init();
});