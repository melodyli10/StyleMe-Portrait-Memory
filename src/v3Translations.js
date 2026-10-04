// Presentation-only additions; profile values and editing rules are never translated.
const rows=`Simple controls. Your style, your way.|简单控制，自由呈现你的风格。|간편한 조절로 나만의 스타일을.
Your personal style,|你的专属风格，|나만의 스타일,
saved and ready.|已保存，随时可用。|저장되어 준비됐어요.
Style Profile Progress|风格档案进度|스타일 프로필 진행 상황
Remembered Settings|已记住的设置|기억한 설정
A SIMPLE 6-STEP JOURNEY|简单六步，开启个人风格|간단한 여섯 단계
From your first edit to a personal style you can use again.|从第一次编辑，到可重复使用的专属风格。|첫 편집부터 다시 사용할 나만의 스타일까지.
← Previous|← 上一步|← 이전
Replay|重新演示|다시 보기
YOUR PRIVACY MATTERS|你的隐私很重要|소중한 개인정보
Your photos.|你的照片。|내 사진.
Always yours.|始终属于你。|언제나 내 것.
Portrait processing stays in your browser. StyleMe saves only the confirmed style information needed for your remembered preferences.|肖像处理在浏览器中完成。StyleMe 仅保存你确认的必要风格信息。|사진 처리는 브라우저 안에서 이루어집니다. StyleMe는 확인한 취향에 필요한 스타일 정보만 저장합니다.
You stay in control|决定权始终在你|선택은 언제나 내 손에
Your portrait|你的肖像|내 인물 사진
Local editing|本地编辑|기기 내 편집
Confirmed settings|已确认的设置|확인한 설정
Next portrait|下一张肖像|다음 인물 사진
OUR STORY|我们的故事|우리의 이야기
Editing shouldn't feel like|编辑不应该是|편집이
 a never-ending repeat.|无休止的重复。|끝없는 반복이 되지 않도록.
a never-ending repeat.|无休止的重复。|끝없는 반복이 되지 않도록.
You shouldn't have to make the same small adjustments over and over again. StyleMe remembers the preferences you confirm, so your next edit starts closer to you.|你不必一遍遍重复相同的微调。StyleMe 记住你确认的偏好，让下一次编辑更贴近你的风格。|같은 작은 조절을 매번 반복할 필요는 없어요. StyleMe는 확인한 취향을 기억해 다음 편집의 시작점을 나에게 맞춥니다.
THE PROBLEM|常见困扰|반복되는 고민
Same edits, over and over.|相同编辑，反复进行。|같은 편집의 반복.
A new portrait often means repeating familiar choices — adjusting eye size, refining face shape, checking the result, and doing it again on the next photo. Those small decisions take time and attention.|每张新肖像常常意味着重复熟悉的选择：调整眼睛大小、微调脸型、检查效果，然后在下一张重来。这些小决定也需要时间与精力。|새 사진마다 눈 크기와 얼굴형을 조절하고 결과를 확인하는 익숙한 선택을 반복하곤 합니다. 이런 작은 결정에도 시간과 주의가 필요해요.
OUR SOLUTION|我们的方式|우리의 방법
StyleMe remembers you.|StyleMe 记住你的偏好。|StyleMe가 취향을 기억해요.
StyleMe saves the editing preferences you intentionally confirm and turns them into a personal starting point for future portraits.|StyleMe 保存你主动确认的编辑偏好，为今后的肖像提供个人化的起点。|StyleMe는 직접 확인한 편집 취향을 저장해 다음 사진의 개인적인 시작점으로 활용합니다.
THE RESULT|带来的改变|달라지는 경험
Less repetition. More you.|少些重复，多些自我。|반복은 줄이고, 나답게.
Start closer to the look you already choose, while keeping control of every edit.|从更贴近你偏好的效果开始，同时掌控每次编辑。|원하는 모습에 가까운 시작점에서 모든 편집을 직접 결정하세요.
OUR MISSION|我们的初衷|우리가 지향하는 것
A more you,|更像自己，|더 나답게,
every time.|每一次。|매번.
StyleMe is built to make portrait editing feel personal, consistent and less repetitive — without replacing your judgment.|StyleMe 希望让肖像编辑更个人化、更一致、少些重复，而不替代你的判断。|StyleMe는 내 판단을 대신하지 않으면서 사진 편집을 더 개인적이고 일관되게, 덜 반복적으로 만들고자 합니다.
Made for|为你而设，|누구나
Real People.|真实多元。|나답게.
Add photo|添加照片|사진 추가
Illustrated progress|演示进度|예시 진행 상황`
export const v3Dictionary=Object.fromEntries(rows.split('\n').map(row=>{const [en,zh,ko]=row.split('|');return [en,{en,zh,ko}]}))
