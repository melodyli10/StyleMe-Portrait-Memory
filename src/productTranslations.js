const rows=`AI-generated illustrative adult portrait|AI 生成的成人肖像插画|AI 생성 성인 인물 일러스트
AI-generated illustrative portraits|AI 生成的肖像插画|AI 생성 인물 일러스트
AI-generated illustrations. Not customers or editing results.|AI 生成插画，并非客户照片或编辑结果。|AI 생성 일러스트이며 고객이나 편집 결과가 아닙니다.
Face Slimming works best with a clear, near-frontal portrait. Homepage portraits are AI-generated illustrations, not customers or editing results.|瘦脸适合清晰、接近正面的肖像。首页肖像为 AI 生成插画，并非客户或编辑结果。|얼굴 슬리밍은 선명한 정면 사진에 적합합니다. 홈페이지 인물은 AI 일러스트이며 고객이나 편집 결과가 아닙니다.
Compare|对比|비교
COMPARE|对比|비교
TEACH STYLEME|教会 STYLEME|STYLEME 가르치기
MY STYLE|我的风格|내 스타일
Product navigation|产品导航|제품 탐색
Your Style, Taking Shape.|你的风格，逐渐成形。|내 스타일이 완성되어 갑니다.
Adjust first. Confirm only when this photo feels right.|先调整，满意后再确认这张照片。|먼저 조정하고 마음에 들 때만 확인하세요.
Confirm This Photo|确认这张照片|이 사진 확인
Review Profile →|查看档案 →|프로필 확인 →
Current unsaved strengths:|当前未保存强度：|저장하지 않은 현재 강도:
Five examples confirmed. Try your style on a new portrait; adaptation is not guaranteed.|已确认五个示例。请在新照片上尝试；不保证会触发适配。|다섯 예시를 확인했습니다. 새 사진에 적용해 보세요. 적응은 보장되지 않습니다.
Review this photo, then confirm or replace it for another example.|检查此照片，然后确认或更换下一张。|사진을 검토한 뒤 확인하거나 다음 예시로 교체하세요.
Upload a setup portrait to begin.|上传教学肖像以开始。|설정용 사진을 업로드하여 시작하세요.
Saved. Your style is taking shape.|保存成功。你的风格正在成形。|저장했습니다. 내 스타일이 만들어지고 있습니다.
A style that feels like you.|属于你的个人风格。|나를 닮은 스타일.
Current edits are temporary. Only confirmed choices become your profile.|当前编辑是临时的。只有确认的选择才进入档案。|현재 편집은 임시입니다. 확인한 선택만 프로필에 반영됩니다.
Apply My Style|应用我的风格|내 스타일 적용
Download PNG|下载 PNG|PNG 다운로드
No image to export.|没有可导出的图片。|내보낼 이미지가 없습니다.
PNG export failed.|PNG 导出失败。|PNG 내보내기에 실패했습니다.
Photo changed. Export the current photo again.|照片已更换，请重新导出当前照片。|사진이 변경되었습니다. 현재 사진을 다시 내보내세요.
PNG downloaded at original resolution.|已按原始分辨率下载 PNG。|원본 해상도로 PNG를 다운로드했습니다.
Center divider|居中对比分隔线|구분선 가운데로
Before/after divider|编辑前后对比分隔线|편집 전후 구분선
One portrait. Your choices.|同一张肖像，你的选择。|하나의 사진, 나의 선택.
Fixed Preset keeps saved strengths. Smart Style adapts only when your setup examples support it.|固定预设保持保存强度。智能记忆风格仅在教学示例支持时进行适配。|고정 프리셋은 저장 강도를 유지합니다. 스마트 스타일은 설정 예시가 뒷받침할 때만 조정합니다.
Compare My Style|对比我的风格|내 스타일 비교
Upload one valid portrait and save a style first.|请先上传有效的单人肖像并保存风格。|유효한 인물 사진을 올리고 스타일을 먼저 저장하세요.
Original|原图|원본
Applied settings explained|查看实际应用设置说明|적용된 설정 설명
Fixed Preset and Smart Style produced identical pixels.|固定预设与智能记忆风格产生了相同像素。|고정 프리셋과 스마트 스타일의 픽셀이 동일합니다.
The outputs differ. Compare your own preference; neither mode is guaranteed better.|输出不同，请根据个人喜好比较；不保证哪种模式更好。|결과가 다릅니다. 취향에 따라 비교하세요. 어느 모드가 더 낫다고 보장하지 않습니다.
Delete your teaching profile? This cannot be undone.|删除教学档案？此操作无法撤销。|학습 프로필을 삭제할까요? 되돌릴 수 없습니다.
Delete your saved quick preset? This cannot be undone.|删除保存的快速预设？此操作无法撤销。|저장된 빠른 프리셋을 삭제할까요? 되돌릴 수 없습니다.`
export const productDictionary=Object.fromEntries(rows.split('\n').map(row=>{const [en,zh,ko]=row.split('|');return [en,{en,zh,ko}]}))
