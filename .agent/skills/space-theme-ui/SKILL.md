---
name: space-theme-ui
description: 우주 테마 CSS 패턴 - 별 배경, 글로우 효과, 다크 모드, 우주 색상 팔레트
---

# Space Theme UI Skill

우주/달 탐사 게임에 어울리는 시각적 스타일 패턴입니다.

## 색상 팔레트
```css
:root {
  --bg-dark: #0a0e1a;
  --bg-panel: #0f1629;
  --bg-card: #141d35;
  --accent-blue: #4fc3f7;
  --accent-purple: #b39ddb;
  --accent-gold: #ffd54f;
  --accent-green: #69f0ae;
  --accent-red: #ef5350;
  --text-primary: #e8eaf6;
  --text-secondary: #90a4ae;
  --glow-blue: 0 0 10px rgba(79, 195, 247, 0.5);
  --glow-gold: 0 0 10px rgba(255, 213, 79, 0.5);
}
```

## 별 배경 애니메이션
```css
.stars {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: 
    radial-gradient(ellipse at center, #1a2a4a 0%, #0a0e1a 100%);
  overflow: hidden;
  z-index: -1;
}
/* JS로 별 생성: 작은 흰 점들을 절대위치로 배치 후 twinkle 애니메이션 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
```

## 패널 스타일
```css
.panel {
  background: var(--bg-panel);
  border: 1px solid rgba(79, 195, 247, 0.2);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
}
```

## 버튼 스타일
```css
.btn-primary {
  background: linear-gradient(135deg, #1565c0, #4fc3f7);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  padding: 10px 20px;
  transition: all 0.2s ease;
  box-shadow: var(--glow-blue);
}
.btn-primary:hover { transform: translateY(-2px); filter: brightness(1.2); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
```

## 진행 바
```css
.progress-bar {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
}
.progress-fill {
  background: linear-gradient(90deg, #4fc3f7, #b39ddb);
  height: 100%;
  transition: width 0.3s ease;
  box-shadow: var(--glow-blue);
}
```

## 로켓 애니메이션
```css
@keyframes rocketFloat {
  0%, 100% { transform: translateY(0px) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}
@keyframes launch {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-200vh) scale(0.3); opacity: 0; }
}
```

## 숫자 증가 애니메이션
```css
@keyframes numberPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); color: var(--accent-gold); }
  100% { transform: scale(1); }
}
```
