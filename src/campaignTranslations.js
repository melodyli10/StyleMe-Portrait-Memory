const rows=`Different faces.|不同面孔。|다양한 얼굴.
Your style.|你的风格。|나만의 스타일.
StyleMe campaign visuals. Not customers, editing results or sample inputs.|StyleMe 品牌宣传视觉，并非顾客、编辑结果或示例输入。|StyleMe 캠페인 이미지입니다. 고객, 편집 결과 또는 샘플 입력이 아닙니다.
Homepage models are campaign visuals, not customers or editing results.|首页模特为品牌宣传视觉，并非顾客或编辑结果。|홈페이지 모델은 캠페인 이미지이며 고객이나 편집 결과가 아닙니다.
Saved from your confirmed style. Current edits are temporary.|来自你确认的风格。当前编辑为临时调整。|확정한 스타일에서 저장되었습니다. 현재 편집은 임시입니다.
MEMORY WALKTHROUGH|风格记忆演示|스타일 기억 안내
See how remembering works.|看看风格如何被记住。|스타일을 기억하는 과정을 살펴보세요.
Illustrated simulation. No photo is edited and nothing is saved.|示意模拟：不会编辑照片，也不会保存任何数据。|일러스트 시뮬레이션입니다. 사진을 편집하거나 데이터를 저장하지 않습니다.
Play / Replay|播放 / 重播|재생 / 다시 재생
Previous|上一步|이전
Portrait loaded|肖像已载入|사진 불러옴
Adjust your look|调整你的偏好|원하는 모습 조정
Confirm preference|确认偏好|선호 확정
Your style is remembered|你的风格已记住|스타일이 기억되었습니다
New portrait illustration|新肖像示意|새 사진 일러스트
Remembered strength applied|已应用记忆强度|기억한 강도 적용됨
Illustrated preference: 60|示意偏好：60|예시 선호 강도: 60
No illustrated preference yet|尚无示意偏好|아직 예시 선호 없음`
export const campaignDictionary=Object.fromEntries(rows.split('\n').map(row=>{const [en,zh,ko]=row.split('|');return [en,{en,zh,ko}]}))
