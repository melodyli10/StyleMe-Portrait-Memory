import {finalCopy} from './finalCopy.js'
import {v3Dictionary} from './v3Translations.js'
import {campaignDictionary} from './campaignTranslations.js'
import {refinementDictionary} from './refinementTranslations.js'
import {loadLocaleFonts} from './fontLoader.js'
import {uxDictionary} from './uxTranslations.js'
import {productDictionary} from './productTranslations.js'
// Presentation-only dictionary. No algorithm, image state or profile is translated.
export const LANGUAGE_KEY = 'styleme.language.v1'
export const LANGUAGES = ['en', 'zh', 'ko']
const rows = `Your edits|你的编辑|내 편집
Unequal visible cheek widths:|可见脸颊宽度不一致：|보이는 볼 너비 차이:
% of configured strength.|% 的设定强度。|%의 설정 강도.
Portrait workspace|肖像工作区|인물 작업 공간
Portrait editing controls|肖像编辑控制|인물 편집 제어
Uploaded original portrait|上传的原始肖像|업로드한 원본 인물 사진
Edited portrait|编辑后的肖像|편집한 인물 사진
Original eye detail|原始眼部细节|원본 눈 상세
Edited eye detail|编辑后的眼部细节|편집한 눈 상세
Eye Detail comparison|眼部细节对比|눈 상세 비교
Detection and privacy|检测与隐私|감지 및 개인정보
Preferences must contain eye and face integers from 0 to 100.|偏好需要 0 至 100 的眼睛与瘦脸整数。|취향은 0~100의 눈과 얼굴 정수여야 합니다.
Unsupported preference version.|不支持此偏好版本。|지원하지 않는 취향 버전.
Home|首页|홈
Studio|工作室|스튜디오
My Style|我的风格|내 스타일
How It Works|使用方法|사용 방법
Privacy|隐私|개인정보
About|关于|소개
Language|语言|언어
Your edits, remembered.|你的修法，记得住。|당신의 편집을 기억합니다.
Your edits,|你的修法，|당신의 편집,
remembered.|记得住。|기억합니다.
A MORE YOU, EVERY TIME|每一次，都更像你|언제나 더 나답게
Teach StyleMe your preferences.|教 StyleMe 了解你的偏好。|StyleMe에 취향을 알려주세요.
Apply your personal style to your next portrait.|将你的个人风格应用于下一张肖像。|다음 인물 사진에 나만의 스타일을 적용하세요.
Start Editing|开始编辑|편집 시작
Teach My Style|教会我的风格|내 스타일 가르치기
Privacy-first|隐私优先|개인정보 우선
Photos stay on your device|照片仅留在你的设备上|사진은 기기에만 보관됩니다
Your style, your way|你的风格，由你决定|내 스타일, 내 방식대로
Only confirmed settings are saved|仅保存你确认的设置|확인한 설정만 저장됩니다
Less repetitive editing|减少重复修图|반복 편집 줄이기
Start closer, every time|每次都更接近你的偏好|매번 취향에 더 가깝게 시작
Same you|依然是你|그대로의 나
A smarter edit|更懂你的编辑|더 스마트한 편집
Your|你的|나만의
Style|风格|스타일
Anytime|随时|언제나
One style.|一种风格。|하나의 스타일.
More possibilities.|更多可能。|더 많은 가능성.
How StyleMe Works|StyleMe 如何运作|StyleMe 사용 방법
A simple 3-step journey to your personal|三个简单步骤，打造专属|나만의 편집 스타일을 만드는
editing style.|修图风格。|간단한 3단계.
Edit Your Photo|编辑照片|사진 편집
Upload a portrait and|上传肖像照片，|인물 사진을 업로드하고
adjust it to your preference.|按你的喜好调整。|취향에 맞게 조정하세요.
Teach StyleMe|教会 StyleMe|StyleMe 가르치기
Confirm up to five photos|确认最多五张照片，|최대 다섯 장을 확인하여
 to build your personal style.|打造你的个人风格。|나만의 스타일을 만드세요.
to build your personal style.|打造你的个人风格。|나만의 스타일을 만드세요.
Apply Your Style|应用你的风格|내 스타일 적용
Upload a new portrait and|上传新的肖像，|새 인물 사진을 업로드하고
apply your remembered style.|应用记忆中的风格。|기억된 스타일을 적용하세요.
Made for|为每一个|모두를 위한
Real People|真实的你|StyleMe
Different faces. Same idea.|不同面孔，同样理念。|다른 얼굴, 같은 생각.
StyleMe adapts to your personal preferences, not a beauty standard.|StyleMe 适应你的个人偏好，而非统一的审美标准。|StyleMe는 미의 기준이 아닌 개인 취향에 맞춥니다.
My style|我的风格|내 스타일
My way|我的方式|내 방식
Natural|自然|자연스럽게
Confident|自信|자신 있게
Brighter you|更明亮的你|더 빛나는 나
Remembered|被记住|기억되는
Unique|独特|특별하게
Always you|始终是你|언제나 나답게
Asset pending|素材待补充|이미지 준비 중
Portrait placeholders · photographs pending|肖像占位图 · 照片待补充|인물 자리표시자 · 사진 준비 중
Portrait asset placeholder|肖像素材占位图|인물 이미지 자리표시자
Editorial portrait placeholders — approved photographs pending|编辑风格肖像占位图，待提供获许可照片|에디토리얼 인물 자리표시자 — 승인된 사진 준비 중
Main navigation|主导航|주 탐색
StyleMe home|StyleMe 首页|StyleMe 홈
YOUR PORTRAIT, YOUR PREFERENCE|你的肖像，你的偏好|내 사진, 내 취향
Your personal studio.|你的专属工作室。|나만의 스튜디오.
Start with your original. Make it a little more you.|从原图开始，让它更像你。|원본에서 시작해 더 나답게 만드세요.
Your portrait|你的肖像|내 인물 사진
An original worth keeping.|值得珍藏的原图。|간직하고 싶은 원본.
Upload photo|上传照片|사진 업로드
Replace photo|更换照片|사진 교체
A little more you.|更像你一点。|조금 더 나답게.
Choose a portrait to begin.|选择肖像照片开始。|인물 사진을 선택하여 시작하세요.
JPG or PNG · up to 30 MB / 24 MP|JPG 或 PNG · 最大 30 MB / 2400 万像素|JPG 또는 PNG · 최대 30 MB / 24 MP
ORIGINAL|原图|원본
EDITED|编辑后|편집본
EYE ENLARGEMENT|眼睛放大|눈 확대
FACE|瘦脸|얼굴
Large previews|大图预览|크게 보기
Show landmarks on original|在原图显示特征点|원본에 랜드마크 표시
Eye Enlargement|眼睛放大|눈 확대
Face Slimming|瘦脸|얼굴 슬리밍
Experimental|实验性|실험적
Original · 0|原图 · 0|원본 · 0
Subtle maximum · 100|自然增强上限 · 100|자연스러운 최대값 · 100
Conservative maximum · 100|保守上限 · 100|보수적 최대값 · 100
Upload a clear single-person portrait to enable face slimming.|上传清晰的单人肖像以启用瘦脸。|선명한 1인 사진을 업로드하면 슬리밍을 사용할 수 있습니다.
Nearby hair and background can move. Keep slimming at 0 if hair hides the cheek or jaw, and check straight lines around the face.|附近的头发和背景可能变形。头发遮住脸颊或下颌时，请将瘦脸设为 0，并检查脸部附近的直线。|주변 머리카락과 배경이 움직일 수 있습니다. 머리카락이 볼이나 턱을 가리면 0을 유지하고 주변 직선을 확인하세요.
Reset to Original|恢复原图|원본으로 초기화
Upload a clear single-person portrait to enable eye adjustment.|上传清晰的单人肖像以启用眼睛调整。|선명한 1인 사진을 업로드하면 눈 조정을 사용할 수 있습니다.
Retouch Memory|修图记忆|리터치 메모리
Confirm your choices on up to five different setup photos. A local statistical profile, not neural-network training.|在最多五张不同照片上确认你的选择。使用本地统计档案，不是训练神经网络。|최대 다섯 장의 서로 다른 사진에서 선택을 확인하세요. 로컬 통계 프로필이며 신경망 학습이 아닙니다.
Confirm This Setup Photo|确认这张教学照片|이 설정 사진 확인
Update This Setup Example|更新这条教学示例|이 설정 예시 업데이트
Clear Teaching Profile|清除教学档案|학습 프로필 지우기
Review teaching profile|查看教学档案|학습 프로필 확인
No confirmed examples.|暂无已确认示例。|확인된 예시가 없습니다.
No saved preferences.|暂无已保存偏好。|저장된 취향이 없습니다.
Comparison mode|对比模式|비교 모드
Fixed Preset|固定预设|고정 프리셋
Smart Style|智能记忆风格|스마트 스타일
Include Face Slimming for this photo|为这张照片启用瘦脸|이 사진에 얼굴 슬리밍 포함
Save My Preferences|保存我的偏好|내 취향 저장
Apply Remembered Style|应用记忆风格|기억된 스타일 적용
Clear Memory|清除记忆|메모리 지우기
Only confirmed settings, compact teaching ratios and duplicate-check digests are saved locally. No images or raw landmarks. Slider changes are not saved automatically.|仅在本地保存已确认设置、简要几何比例和去重摘要。不保存图片或原始特征点，也不会自动保存滑块变化。|확인한 설정, 요약 기하 비율, 중복 확인 해시만 로컬에 저장합니다. 이미지와 원시 랜드마크는 저장하지 않으며 슬라이더 변경도 자동 저장하지 않습니다.
No remembered style applied.|尚未应用记忆风格。|기억된 스타일이 적용되지 않았습니다.
Eye Detail|眼部细节|눈 상세 보기
The same crop and display scale. Both eyes, genuine image pixels.|相同裁剪与显示比例。双眼均为真实图像像素。|동일한 자르기와 배율로 양쪽 눈의 실제 픽셀을 비교합니다.
FACE DETECTION|人脸检测|얼굴 감지
Loading face model…|正在加载人脸模型…|얼굴 모델 로딩 중…
Upload a single-person portrait to begin.|上传单人肖像以开始。|1인 사진을 업로드하여 시작하세요.
Retry detection|重试检测|감지 다시 시도
PRIVATE BY DESIGN|隐私源于设计|개인정보를 위한 설계
Your photo stays in this browser.|照片保留在此浏览器中。|사진은 이 브라우저에만 있습니다.
No photo uploads or saved portraits. The face model downloads from Google; detection runs on your device.|不上传或保存肖像。人脸模型从 Google 下载，检测在你的设备上运行。|사진은 전송하거나 저장하지 않습니다. Google에서 모델을 다운로드하고 기기에서 감지합니다.
Confirmed preferences|已确认偏好|확인된 취향
Your original stays untouched.|原图始终不变。|원본은 그대로 유지됩니다.
Profile median|档案中位数|프로필 중앙값
Saved/profile eye|保存/档案眼睛|저장/프로필 눈
Saved|已保存|저장됨
Applied eye|实际应用眼睛|적용된 눈
No saved settings.|暂无保存设置。|저장된 설정이 없습니다.
Manual values; no remembered-style adaptation active.|手动设置；当前未启用记忆风格适配。|수동 값이며 기억된 스타일 조정은 비활성입니다.
confirmed examples.|已确认示例。|확인된 예시.
The taught profile is used by Apply Remembered Style.|“应用记忆风格”使用教学档案。|기억된 스타일 적용은 학습 프로필을 사용합니다.
Existing quick-save memory remains available.|现有快速保存偏好仍可使用。|기존 빠른 저장 취향도 사용할 수 있습니다.
Example|示例|예시
unavailable|不可用|사용 불가
face|瘦脸|얼굴
 eye | 眼睛 | 눈 
, face |，瘦脸 |, 얼굴 
eye height/width|眼睛高宽比|눈 높이/너비
face width balance|脸宽平衡比|얼굴 너비 균형
A consistent eye-aspect rule passed setup cross-validation; effectiveness on new portraits remains unproven.|一致的眼睛高宽比规则通过了教学交叉验证；在新肖像上的效果仍未证实。|일관된 눈 비율 규칙이 설정 교차 검증을 통과했지만 새 사진에서 효과는 검증되지 않았습니다.
Five valid eye examples are needed for a geometry-dependent rule.|几何适配规则需要五个有效的眼部示例。|기하 기반 규칙에는 유효한 눈 예시 다섯 개가 필요합니다.
Setup geometry or preferred strengths vary too little; using the median.|教学几何或偏好强度变化太小；使用中位数。|설정 기하 또는 선호 강도 변화가 너무 작아 중앙값을 사용합니다.
Setup examples do not show a consistent geometry/preference relationship.|教学示例未显示一致的几何与偏好关系。|설정 예시에 일관된 기하/취향 관계가 없습니다.
Insufficient distinct geometry for validation.|缺少足够不同的几何数据进行验证。|검증할 서로 다른 기하 데이터가 부족합니다.
Held-out setup predictions do not sufficiently improve on the median.|留出示例的预测相对中位数未有足够改善。|제외한 예시의 예측이 중앙값보다 충분히 개선되지 않았습니다.
New eye geometry is missing or outside the taught range; using the median without extrapolation.|新眼部几何缺失或超出教学范围；使用中位数，不进行外推。|새 눈 기하가 없거나 학습 범위 밖이므로 외삽 없이 중앙값을 사용합니다.
Setup-supported eye aspect rule|教学支持的眼睛比例规则|설정이 뒷받침하는 눈 비율 규칙
height/width|高宽比|높이/너비
median|中位数|중앙값
applied|实际应用|적용됨
Limited to taught strengths and ±20 slider points; not a pose/confidence estimate.|限制在教学强度和中位数±20滑块点内；不是姿态或置信度估计。|학습 강도와 중앙값 ±20으로 제한하며 자세/신뢰도 추정이 아닙니다.
Face model ready · on-device detection|人脸模型已就绪 · 设备本地检测|얼굴 모델 준비 완료 · 기기 내 감지
Face model unavailable. Check your connection and retry.|人脸模型不可用。请检查网络后重试。|얼굴 모델을 사용할 수 없습니다. 연결을 확인하고 다시 시도하세요.
Ready. Cheeks and lower jaw only; central features and chin are protected.|已就绪。仅调整脸颊与下颌，保护中心五官和下巴。|준비 완료. 볼과 아래턱만 조정하고 중앙 이목구비와 턱끝은 보호합니다.
No active edits. Adjust either feature independently.|尚无编辑。可分别调整各项功能。|적용된 편집이 없습니다. 각 기능을 개별 조정하세요.
Full configured strength.|使用完整设定强度。|설정된 전체 강도.
Effective contour coefficient:|实际轮廓系数：|유효 윤곽 계수:
% of mean half-width; balanced to both sides’ safe space and tapered near the chin.|% 的平均半脸宽度；平衡两侧安全空间，并在下巴附近逐渐减弱。|%의 평균 반너비; 양쪽 안전 공간에 맞추고 턱끝에서 줄입니다.
Active:|当前启用：|활성:
Check the portrait and contour boundaries.|请检查肖像与轮廓边界。|사진과 윤곽 경계를 확인하세요.
Both strengths 0: exact original pixels restored.|两项强度均为 0：已精确恢复原始像素。|두 강도 모두 0: 원본 픽셀을 정확히 복원했습니다.
Rendering failed. Original preserved; retry detection or use another photo.|渲染失败。原图已保留；请重试检测或换一张照片。|렌더링 실패. 원본은 보존되었습니다. 감지를 재시도하거나 다른 사진을 사용하세요.
Detecting a face before enabling edits…|正在检测人脸，完成后启用编辑…|편집 활성화 전에 얼굴 감지 중…
Preparing face detection…|正在准备人脸检测…|얼굴 감지 준비 중…
Photo loaded. Detection needs the face model; check your connection and retry.|照片已加载。检测需要人脸模型；请检查网络后重试。|사진을 불러왔습니다. 감지에 모델이 필요합니다. 연결을 확인하고 다시 시도하세요.
Edits unavailable until face detection succeeds.|人脸检测成功后才可编辑。|얼굴 감지가 성공해야 편집할 수 있습니다.
Face slimming needs successful face detection.|瘦脸需要成功检测人脸。|슬리밍에는 성공적인 얼굴 감지가 필요합니다.
Detecting face landmarks…|正在检测人脸特征点…|얼굴 랜드마크 감지 중…
No face detected. Try a clear, well-lit portrait facing the camera.|未检测到人脸。请尝试清晰、光线充足、正对相机的肖像。|얼굴을 감지하지 못했습니다. 밝고 선명한 정면 사진을 사용하세요.
Multiple faces detected. Choose a photo with just one person for this project.|检测到多张人脸。请使用仅有一个人的照片。|여러 얼굴이 감지되었습니다. 한 명만 있는 사진을 선택하세요.
One face detected|检测到一张人脸|얼굴 1개 감지
landmarks. Original photo unchanged.|个特征点。原图未改变。|개 랜드마크. 원본은 그대로입니다.
No face detected: both edits disabled; original preserved.|未检测到人脸：两项编辑已停用，原图保留。|얼굴 미감지: 두 편집 모두 비활성, 원본 보존.
Edits require exactly one detected face.|编辑需要检测到且仅检测到一张人脸。|편집에는 정확히 한 개의 얼굴이 필요합니다.
Detection failed. Retry or choose a smaller, clearer portrait.|检测失败。请重试或使用更小、更清晰的肖像。|감지 실패. 재시도하거나 더 작고 선명한 사진을 선택하세요.
Eye adjustment unavailable. Original preserved.|眼部调整不可用。原图已保留。|눈 조정을 사용할 수 없습니다. 원본은 보존되었습니다.
Reading a new photo; previous edits have been cleared.|正在读取新照片；之前的编辑已清除。|새 사진을 읽는 중이며 이전 편집은 초기화되었습니다.
Reading photo…|正在读取照片…|사진 읽는 중…
Previous photo remains displayed.|仍显示上一张照片。|이전 사진이 계속 표시됩니다.
Eye adjustment disabled. Choose a valid photo or retry detection on the previous photo.|眼部调整已停用。请选择有效照片，或对上一张照片重试检测。|눈 조정이 비활성입니다. 유효한 사진을 선택하거나 이전 사진 감지를 다시 시도하세요.
This file is empty. Choose a JPG or PNG photo.|文件为空。请选择 JPG 或 PNG 照片。|빈 파일입니다. JPG 또는 PNG 사진을 선택하세요.
Choose a photo smaller than 30 MB.|请选择小于 30 MB 的照片。|30 MB보다 작은 사진을 선택하세요.
Unsupported file. Choose a real JPG, JPEG or PNG image.|不支持此文件。请选择真实的 JPG、JPEG 或 PNG 图像。|지원하지 않는 파일입니다. 실제 JPG, JPEG 또는 PNG 이미지를 선택하세요.
This photo is too large. Use up to 24 megapixels and 8192 pixels per side.|照片太大。请使用不超过 2400 万像素、单边不超过 8192 像素的照片。|사진이 너무 큽니다. 최대 24 MP, 한 변 8192픽셀을 사용하세요.
This image could not be read. It may be corrupted; try another JPG or PNG.|无法读取图像，文件可能已损坏；请尝试另一张 JPG 或 PNG。|이미지를 읽을 수 없습니다. 손상되었을 수 있으니 다른 JPG 또는 PNG를 사용하세요.
Teaching profile could not be read. Clear Teaching Profile can remove an invalid record.|无法读取教学档案。可使用“清除教学档案”删除无效记录。|학습 프로필을 읽지 못했습니다. 프로필 지우기로 잘못된 기록을 삭제할 수 있습니다.
Saved preferences could not be read (storage unavailable or invalid record). Clear Memory can remove an invalid record; photos are unaffected.|无法读取偏好（存储不可用或记录无效）。可清除记忆删除无效记录；照片不受影响。|취향을 읽지 못했습니다(저장소 불가 또는 잘못된 기록). 메모리를 지워 삭제할 수 있으며 사진에는 영향이 없습니다.
Quick preset saved; the taught profile stays active until Clear Teaching Profile.|快速预设已保存；教学档案仍优先使用，直至清除。|빠른 프리셋 저장 완료. 학습 프로필은 지울 때까지 우선 적용됩니다.
Confirmed preferences saved on this browser. Later slider changes are not saved automatically.|确认的偏好已保存在此浏览器。之后的滑块变化不会自动保存。|확인된 취향이 이 브라우저에 저장되었습니다. 이후 슬라이더 변경은 자동 저장되지 않습니다.
Preferences could not be saved. Browser storage may be unavailable or full; current edits are unchanged.|无法保存偏好。浏览器存储可能不可用或已满；当前编辑不变。|취향을 저장하지 못했습니다. 저장소가 없거나 가득 찼을 수 있습니다. 현재 편집은 유지됩니다.
Quick-save memory cleared. Taught profile remains; use Clear Teaching Profile to remove it.|快速记忆已清除。教学档案仍保留；请单独清除教学档案。|빠른 메모리 삭제 완료. 학습 프로필은 별도로 지워야 합니다.
Saved preferences cleared. Current edits are unchanged.|已清除保存的偏好。当前编辑不变。|저장된 취향을 지웠습니다. 현재 편집은 유지됩니다.
Memory could not be cleared. Browser storage is unavailable.|无法清除记忆。浏览器存储不可用。|메모리를 지우지 못했습니다. 저장소를 사용할 수 없습니다.
Setup choice confirmed. Profile medians updated; current edits unchanged. Replace the photo for the next example.|教学选择已确认，中位数已更新；当前编辑不变。更换照片以添加下一条示例。|설정 확인, 프로필 중앙값 갱신 완료. 현재 편집은 유지됩니다. 다음 예시를 위해 사진을 교체하세요.
Example could not be saved:|无法保存示例：|예시 저장 실패:
Teaching profile cleared; quick-save memory and current edits are unchanged.|教学档案已清除；快速记忆与当前编辑不变。|학습 프로필 삭제 완료. 빠른 메모리와 현재 편집은 유지됩니다.
Teaching profile could not be cleared; browser storage unavailable.|无法清除教学档案；浏览器存储不可用。|학습 프로필을 지우지 못했습니다. 저장소를 사용할 수 없습니다.
No usable single-face detection. Edits skipped.|没有可用的单人脸检测，已跳过编辑。|사용 가능한 단일 얼굴 감지가 없어 편집을 건너뜁니다.
Eye edit skipped:|已跳过眼部编辑：|눈 편집 생략:
Face edit skipped:|已跳过瘦脸：|얼굴 편집 생략:
Invalid eye geometry.|眼部几何无效。|잘못된 눈 기하.
Invalid contour geometry.|轮廓几何无效。|잘못된 윤곽 기하.
Face slimming excluded: opt in for this photo to apply its saved strength.|未启用瘦脸：需为这张照片明确选择后才应用保存的强度。|슬리밍 제외: 이 사진에서 직접 선택해야 저장 강도가 적용됩니다.
Face warp retains its existing spatial safety limits in both modes; see the face status for its effective coefficient.|两种模式均保留瘦脸的空间安全限制；实际系数见瘦脸状态。|두 모드 모두 기존 공간 안전 한계를 유지합니다. 유효 계수는 얼굴 상태를 확인하세요.
saved slider strengths unchanged where eligible; mandatory algorithm safety checks still apply.|条件允许时使用原保存强度；仍执行算法安全检查。|가능한 경우 저장 강도를 유지하며 필수 안전 검사는 그대로 적용됩니다.
uses this photo’s valid geometry and the teaching evidence described above.|使用本照片的有效几何与上述教学证据。|이 사진의 유효한 기하와 위 학습 근거를 사용합니다.
fitted to this photo’s landmarks. No additional strength adaptation is justified by the current measurements; eligible saved strengths are unchanged.|使用本照片特征点。当前测量不足以支持额外强度调整；有效的保存强度保持不变。|이 사진의 랜드마크에 맞춥니다. 측정값이 추가 강도 조정을 뒷받침하지 않아 저장 강도를 유지합니다.
Eye landmarks are missing or invalid. Eye adjustment is unavailable.|眼部特征点缺失或无效，无法调整。|눈 랜드마크가 없거나 잘못되어 조정할 수 없습니다.
Eye landmarks are missing or outside the photo. Try a clearer portrait.|眼部特征点缺失或超出照片。请使用更清晰的肖像。|눈 랜드마크가 없거나 사진 밖입니다. 더 선명한 사진을 사용하세요.
The eyes are too small to adjust safely. Use a closer portrait.|眼部过小，无法安全调整。请使用更近的肖像。|눈이 너무 작습니다. 더 가까운 인물 사진을 사용하세요.
Eye geometry is unreliable or the eyes are nearly closed. Try an open-eyed, frontal portrait.|眼部几何不可靠或眼睛接近闭合。请用睁眼正面肖像。|눈 기하가 불안정하거나 거의 감겨 있습니다. 눈을 뜬 정면 사진을 사용하세요.
Too little room around the eyelids for a safe adjustment.|眼睑周围安全调整空间不足。|눈꺼풀 주변 안전 공간이 부족합니다.
An eye is too close to the photo edge. Use an uncropped portrait.|眼睛过于靠近照片边缘。请使用未裁剪肖像。|눈이 사진 가장자리에 너무 가깝습니다. 자르지 않은 사진을 사용하세요.
Not enough safe space around the entire eye for uniform enlargement. Try a clearer, more frontal portrait.|眼部整体均匀放大的安全空间不足。请使用更清晰、更正面的肖像。|눈 전체를 균일 확대할 공간이 부족합니다. 더 선명한 정면 사진을 사용하세요.
An eye region reaches the nose bridge. Eye adjustment is disabled for this pose.|眼部区域触及鼻梁，此姿态下停用眼部调整。|눈 영역이 콧등에 닿아 이 자세에서는 눈 조정이 비활성입니다.
The eye regions overlap or differ too much in size. Try a more frontal portrait.|眼部区域重叠或尺寸差异过大。请使用更正面的肖像。|눈 영역이 겹치거나 크기 차이가 너무 큽니다. 정면 사진을 사용하세요.
Face contour landmarks are missing or invalid. Slimming is unavailable.|面部轮廓特征点缺失或无效，瘦脸不可用。|얼굴 윤곽 랜드마크가 없거나 잘못되어 슬리밍을 사용할 수 없습니다.
The face is too small for a safe contour edit.|人脸过小，无法安全调整轮廓。|얼굴이 너무 작아 안전한 윤곽 편집이 어렵습니다.
The cheek/jaw contour is unreliable or strongly turned. Try a more frontal portrait.|脸颊/下颌轮廓不可靠或转角过大。请使用更正面的肖像。|볼/턱 윤곽이 불안정하거나 크게 돌아가 있습니다. 정면 사진을 사용하세요.
Jaw contour does not approach the detected chin in order.|下颌轮廓未按顺序连接检测到的下巴。|턱선이 감지된 턱끝으로 순서대로 이어지지 않습니다.
The face sides cannot be separated reliably.|无法可靠区分面部两侧。|얼굴 양쪽을 안정적으로 분리할 수 없습니다.
There is too little safe cheek/jaw area below the eyes.|眼睛下方的脸颊/下颌安全区域不足。|눈 아래 볼/턱의 안전 영역이 부족합니다.
No shared cheek/jaw space remains outside protected features.|保护五官之外没有可用的两侧共同调整空间。|보호된 이목구비 밖에 양쪽 공통 볼/턱 공간이 없습니다.
The contour is too close to the photo edge. Use an uncropped portrait.|轮廓过于接近照片边缘。请使用未裁剪肖像。|윤곽이 사진 가장자리에 너무 가깝습니다. 자르지 않은 사진을 사용하세요.
Invalid confirmed example.|确认的示例无效。|잘못된 확인 예시.
Invalid teaching profile.|教学档案无效。|잘못된 학습 프로필.
Duplicate teaching photo.|教学照片重复。|중복된 학습 사진.
Five examples already confirmed. Clear the profile to start a new set.|已确认五个示例。请清除档案后开始新一组。|다섯 예시가 이미 확인되었습니다. 새로 시작하려면 프로필을 지우세요.
Your photo stays yours.|你的照片，始终属于你。|내 사진은 나만의 것.
Portrait processing runs in your browser. Photos, pixels and raw landmarks are never saved in localStorage.|肖像处理在浏览器运行。照片、像素和原始特征点不会保存到 localStorage。|인물 처리는 브라우저에서 실행됩니다. 사진, 픽셀, 원시 랜드마크는 localStorage에 저장하지 않습니다.
Only confirmed numerical preferences, teaching geometry ratios and duplicate-check digests are stored on this browser. Clear Memory removes the quick preset; Clear Teaching Profile removes setup examples.|仅保存确认的数字偏好、教学几何比例和去重摘要。清除记忆删除快速预设；清除教学档案删除教学示例。|확인된 수치 취향, 기하 비율, 중복 확인 해시만 저장합니다. 메모리 지우기는 빠른 프리셋, 학습 프로필 지우기는 설정 예시를 삭제합니다.
The face model downloads from Google. No portrait is sent with that request. Clearing browser data removes your local profile.|人脸模型从 Google 下载，该请求不发送肖像。清除浏览器数据将删除本地档案。|얼굴 모델은 Google에서 다운로드하며 사진은 전송하지 않습니다. 브라우저 데이터를 지우면 로컬 프로필이 삭제됩니다.
Review my saved settings|查看已保存设置|저장된 설정 확인
A PERSONAL RETOUCH MEMORY|个人修图记忆|개인 리터치 메모리
StyleMe is an NTU MSc Enterprise AI project exploring whether confirmed personal preferences can reduce repetitive portrait corrections.|StyleMe 是 NTU 企业人工智能硕士项目，探索已确认的个人偏好能否减少重复肖像调整。|StyleMe는 확인된 개인 취향이 반복 인물 수정을 줄일 수 있는지 탐구하는 NTU Enterprise AI 석사 프로젝트입니다.
Fixed Preset and Smart Style use the same pixel-editing engine. Smart Style uses a geometry-based rule only when the setup examples support it. Better results have not been established through comparative evaluation.|固定预设与智能记忆风格使用相同像素编辑引擎。仅在教学示例支持时使用几何规则。尚未通过对比评估证明效果更好。|고정 프리셋과 스마트 스타일은 같은 픽셀 엔진을 사용합니다. 설정 예시가 뒷받침할 때만 기하 규칙을 사용하며 더 나은 결과는 비교 평가로 입증되지 않았습니다.
Face Slimming works best with a clear, near-frontal portrait. Homepage silhouettes are asset placeholders, not customers or editing results.|瘦脸适合清晰、接近正面的肖像。首页剪影是素材占位图，不代表客户或编辑结果。|얼굴 슬리밍은 선명한 정면 사진에 적합합니다. 홈페이지 실루엣은 자리표시자이며 고객이나 편집 결과가 아닙니다.`

export const dictionary = Object.fromEntries(rows.split('\n').map(row => { const [en,zh,ko]=row.split('|');return [en,{en,zh,ko}] }))
Object.assign(dictionary,productDictionary,uxDictionary,refinementDictionary,campaignDictionary,v3Dictionary,finalCopy)
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const pattern = new RegExp('(?<![A-Za-z])(?:' + Object.keys(dictionary).sort((a,b)=>b.length-a.length).map(escape).join('|') + ')(?![A-Za-z])','g')
export function translateText(text, language='en') {
 const english=text.replaceAll('StyleMe Adaptive','Smart Style')
 return language==='en'?english:english.replace(pattern,match=>dictionary[match][language]??match)
}
export function loadLanguage(storage) {
 try { const value=storage.getItem(LANGUAGE_KEY); return LANGUAGES.includes(value)?value:'en' } catch { return 'en' }
}
export function mountLanguage(root,selector) {
 let language='en'
 try { language=loadLanguage(window.localStorage) } catch { /* Storage may be blocked. */ }
 const sources=new WeakMap(),attributes=new WeakMap()
 function text(node) {
  if(node.parentElement?.closest('[translate="no"]'))return
  const old=sources.get(node)
  if(!old || node.data!==old.rendered)sources.set(node,{source:node.data,rendered:node.data})
  const record=sources.get(node),rendered=translateText(record.source,language)
  record.rendered=rendered
  if(node.data!==rendered)node.data=rendered
 }
 function visit(node) {
  if(node.nodeType===3){
   // A user filename is data, never a translation key.
   if(node.parentElement?.id==='photo-info' && node.data!=='An original worth keeping.' && !sources.has(node))return
   text(node);return
  }
  if(node.nodeType!==1 || ['SCRIPT','STYLE'].includes(node.tagName) || node.closest('[translate="no"]'))return
  for(const name of ['aria-label','title'])if(node.hasAttribute(name)){
   let record=attributes.get(node);if(!record){record={};attributes.set(node,record)}
   const old=record[name],value=node.getAttribute(name)
   if(!old||value!==old.rendered)record[name]={source:value,rendered:value}
   record[name].rendered=translateText(record[name].source,language)
   if(value!==record[name].rendered)node.setAttribute(name,record[name].rendered)
  }
  if(node.id!=='language')for(const child of node.childNodes)visit(child)
 }
 const observer=new MutationObserver(records=>{
  for(const record of records){if(record.type==='characterData')text(record.target);else if(record.type==='attributes')visit(record.target);else for(const node of record.addedNodes)visit(node)}
 })
 function update(){loadLocaleFonts(language);document.documentElement.lang=language;selector.value=language;visit(root)}
 update();observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title']})
 selector.addEventListener('change',()=>{
  language=LANGUAGES.includes(selector.value)?selector.value:'en'
  try{window.localStorage.setItem(LANGUAGE_KEY,language)}catch{/* Editing remains available if browser storage is blocked. */}
  update()
 })
}
