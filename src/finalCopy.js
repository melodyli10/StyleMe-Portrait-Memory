const rows=`Your personal style, taking shape.|你的专属风格，正在形成。|나만의 스타일, 만들어가는 중이에요.
Your personal style, saved and ready.|你的专属风格，已经准备好了。|나만의 스타일, 준비됐어요.
PORTRAIT EDITING, PERSONAL TO YOU|专属于你的肖像编辑|나를 위한 인물 보정
Inspect cheeks, hair and background before export. Strong angles or an obscured jaw may reduce the available range.|导出前请检查脸颊、头发和背景。转角较大或下颌被遮挡时，可用调整范围会减小。|내보내기 전에 볼 윤곽, 머리카락과 배경을 확인하세요. 얼굴 각도가 크거나 턱이 가려지면 보정 범위가 줄어들 수 있습니다.
Use a clear portrait with an unobstructed jaw. Homepage models are campaign visuals, not customers or editing results.|请选择下颌清晰、无遮挡的肖像。首页模特为品牌宣传素材，并非客户或编辑效果。|턱선이 선명하게 드러난 사진을 사용하세요. 홈페이지 모델은 브랜드 이미지이며 고객이나 보정 결과가 아닙니다.
Adjust Eye Enlargement and inspect the before/after divider. Face Slimming starts at zero; adjust it while comparing the contour.|调整眼睛大小，拖动分隔线比较前后效果。瘦脸从零开始，请边调整边检查轮廓。|눈 크기를 조절하고 비교 구분선을 확인하세요. 얼굴 슬리밍은 0에서 시작하며 윤곽을 비교하면서 조절하세요.
Face Slimming|瘦脸|얼굴 슬리밍
Inspect cheeks, hair and background before export. Strong angles or an obscured jaw may reduce the available range.|导出前请检查脸颊、头发和背景。|내보내기 전에 볼 윤곽, 머리카락과 배경을 확인하세요.
Your beauty,|还原你的美，|당신만의 아름다움,
Refine it your way. StyleMe remembers.|修成你喜欢的样子，StyleMe 替你记住。|내 취향대로 보정하면, StyleMe가 기억해요.
Back to Studio|返回工作室|스튜디오로 돌아가기
Resume editing|继续编辑|편집 계속하기
Your current edit is kept. Resume it or choose a new portrait.|当前编辑已保留。你可以继续编辑，或选择新照片。|현재 편집은 유지됩니다. 계속 편집하거나 새 사진을 선택하세요.
Your edits, remembered.|你的修法，记得住。|내가 좋아하는 보정, 기억해요.
Your edits,|你的修法，|내가 좋아하는 보정,
remembered.|记得住。|기억해요.
Every face has its own beauty.|每一张脸，都有自己的美。|모든 얼굴에는 저마다의 아름다움이 있어요.
Different faces do not need to be edited into the same look.|不同的脸，不必修成同一种样子。|서로 다른 얼굴을 같은 모습으로 보정할 필요는 없어요.
OUR PROMISE|我们的承诺|우리의 약속
Your beauty, remembered.|还原你的美，也记住你的美。|당신만의 아름다움, 그대로 기억해요.
Remember the edits you love. Repeat less next time.|记住你喜欢的修法，下一张少一点重复。|좋아하는 보정을 기억하고, 다음엔 덜 반복해요.
Your style is taking shape.|你的风格正在形成。|나만의 스타일을 만들어가는 중이에요.
Keep teaching StyleMe to build a more reliable personal profile.|继续教会 StyleMe，让个人风格更稳定。|StyleMe가 더 안정적으로 기억할 수 있도록 계속 알려주세요.
Your style is saved and ready.|你的风格已经准备好了。|나만의 스타일이 준비됐어요.
Your confirmed preferences are ready to apply.|已确认的修图偏好可以直接应用到新照片。|확인한 보정 취향을 새 사진에 적용할 수 있어요.
Remembered ✓|已记住 ✓|기억했어요 ✓`
export const finalCopy=Object.fromEntries(rows.split('\n').map(row=>{const [en,zh,ko]=row.split('|');return [en,{en,zh,ko}]}))
