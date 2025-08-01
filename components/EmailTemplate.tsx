import * as React from 'react';
import Image from "next/image";

interface EmailTemplateProps {
  logoUrl: string;
  attachmentCount: number;
  notes?: string;
}

// Export as a plain function, not React.FC!
export async function EmailTemplate({
  logoUrl,
  attachmentCount,
  notes,
}: EmailTemplateProps) {
  return (
    <div style={{
      fontFamily: 'Arial, "ヒラギノ角ゴ ProN", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
      background: '#f5f7fa',
      padding: '30px 0'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '32px'
      }}>
        {/* Logo at the top */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Image
            src={logoUrl}
            alt="The DECK Logo"
            style={{ maxWidth: '140px', height: 'auto', marginBottom: '10px' }}
          />
        </div>

        {/* Attachment count box */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: notes ? '16px' : '24px',
          textAlign: 'center'
        }}>
          <span style={{
            fontWeight: 700,
            color: '#856404',
            fontSize: '17px'
          }}>
            添付ファイルあり：{attachmentCount}件
          </span>
        </div>

        {/* Notes container (shown only if notes exist) */}
        {notes && (
          <div style={{
            background: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '6px',
            padding: '14px 18px',
            marginBottom: '24px',
            color: '#1565c0',
            fontSize: '15px'
          }}>
            <strong>担当者からのメモ：</strong>
            <div style={{ marginTop: '6px', whiteSpace: 'pre-line' }}>
              {notes}
            </div>
          </div>
        )}

        {/* Main heading */}
        <h1 style={{
          fontSize: '22px',
          color: '#2c3e50',
          borderBottom: '2px solid #eee',
          paddingBottom: '8px',
          marginBottom: '18px'
        }}>
          新しい郵便物のお知らせ
        </h1>

        {/* Main message container */}
        <div style={{
          background: '#f0f4fa',
          borderRadius: '6px',
          padding: '18px 22px',
          marginBottom: '20px',
          fontSize: '16px',
          color: '#222'
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
            いつもお世話になっております。<br />
            The DECK運営事務局です。<br />
            <strong style={{ color: '#0052cc' }}>新しい郵便物が届きました。</strong>
          </p>
          <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '15px' }}>
            <li>受付窓口での受取時間は（平日10：00〜18：00）です。</li>
            <li>破棄、転送のどちらかをご希望の場合はご連絡ください。</li>
          </ul>
          <div style={{ marginTop: '12px' }}>
            <strong>【転送】</strong>
            <ul style={{ paddingLeft: '20px', fontSize: '15px' }}>
              <li>お預かりは最長1か月となっております。それまでに連絡、またはお受け取りいただけない場合は月末に転送させて頂きます。</li>
              <li>転送物が基準内であれば佐川飛脚メール便での転送となります。</li>
              <li>毎月1回月末転送の佐川飛脚メール便は無料です。</li>
              <li>2通目以降及び佐川飛脚メール便に入らない郵便物及び宅配物については有料転送（実費+手数料税込440円）となります。</li>
              <li>荷物の基準（縦34cm・横25cm・高さ3cm・重量3kg以内）</li>
              <li>郵便局へ差し出し後5日程度でポストインにてお届けとなります。</li>
              <li>基準を超えるものは宅配便（元払）+手数料税込440円にて転送します。料金は、600円〜（地域・サイズ・重量により料金が異なります）</li>
              <li>日時指定はお受けできません。</li>
            </ul>
          </div>
          <div style={{ marginTop: '12px' }}>
            <strong>【受付窓口での受取】</strong>
            <ul style={{ paddingLeft: '20px', fontSize: '15px' }}>
              <li>受付にて直接お渡しいたしますのでご署名（印）をお願いいたします。</li>
            </ul>
          </div>
          <div style={{ marginTop: '12px' }}>
            <strong>【ご注意】</strong>
            <ul style={{ paddingLeft: '20px', fontSize: '15px' }}>
              <li>到着後、3営業日以内のご案内とさせていただいております。お急ぎの郵便物、宅配便等がある場合はお問合わせくださいませ。</li>
              <li>転送連絡をいただきますと、翌営業日午前に転送手続きをさせていただきます。</li>
              <li>お手数をおかけしますが、ご確認のほどよろしくお願い致します。</li>
            </ul>
          </div>
        </div>

        {/* Company info footer */}
        <div style={{
          fontSize: '13px',
          color: '#888',
          borderTop: '1px solid #eee',
          paddingTop: '18px',
          marginTop: '24px'
        }}>
          <p style={{ margin: 0 }}>
            ------------------------------------------------------------<br />
            The DECK株式会社<br />
            〒541-0054 大阪市中央区南本町2-1-1本町サザンビル1F<br />
            Email: <a href="mailto:info@thedeck.jp" style={{ color: '#0052cc' }}>info@thedeck.jp</a><br />
            URL: <a href="https://thedeck.jp/" style={{ color: '#0052cc' }}>https://thedeck.jp/</a>
          </p>
        </div>
      </div>
    </div>
  );
}
