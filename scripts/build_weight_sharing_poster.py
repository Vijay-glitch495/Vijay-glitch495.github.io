"""Build a distinct editorial 48 x 36 inch DeepMath poster and WebP preview.

Requires reportlab, matplotlib, PyMuPDF, Pillow. Scientific content follows the
owner-supplied manuscript, which is not published in this repository.
"""
from pathlib import Path
from io import BytesIO
import math
import tempfile
import fitz
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.mathtext import math_to_image
from matplotlib.font_manager import FontProperties, findfont
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/posters/deepmath-2026-weight-sharing-poster.pdf'
W, H = 3456, 2592
PAPER, INK, MUTED = '#fcfaf5', '#252945', '#5f6c70'
SAGE, RUST, LINE = '#47786b', '#b96c50', '#d2ddd7'
MINT, ROSE = '#e8f0ec', '#f5e8e0'
for name, family, weight in [('Body','DejaVu Sans','normal'), ('Bold','DejaVu Sans','bold'), ('Display','DejaVu Serif','normal')]:
    pdfmetrics.registerFont(TTFont(name, findfont(FontProperties(family=family, weight=weight))))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold')
tmp = tempfile.TemporaryDirectory()
c = canvas.Canvas(str(Path(tmp.name)/'base.pdf'), pagesize=(W,H))
overlays = []

def rect(x,y,w,h,fill,stroke=None,r=0):
    c.setFillColor(HexColor(fill))
    if stroke: c.setStrokeColor(HexColor(stroke)); c.setLineWidth(2)
    c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=bool(stroke))

def text(s,x,y,size=28,color=INK,bold=False,font=None):
    c.setFillColor(HexColor(color)); c.setFont(font or ('Bold' if bold else 'Body'),size)
    c.drawString(x,H-y-size,s)

def para(s,x,y,w,size=27,color=INK,leading=None):
    p=Paragraph(s,ParagraphStyle('p',fontName='Body',fontSize=size,leading=leading or size*1.38,textColor=HexColor(color)))
    _,h=p.wrap(w,2000); p.drawOn(c,x,H-y-h)
    return y+h

def line(x1,y1,x2,y2,color=LINE,width=2):
    c.setStrokeColor(HexColor(color));c.setLineWidth(width);c.line(x1,H-y1,x2,H-y2)

def eq(s,x,y,w,h,size=40,bg=PAPER):
    buf=BytesIO()
    with plt.rc_context({'figure.facecolor': bg, 'savefig.facecolor': bg}):
        math_to_image(s,buf,prop=FontProperties(size=size),format='pdf',color=INK)
    overlays.append((buf.getvalue(),fitz.Rect(x,y,x+w,y+h)))

def heading(num,title,x,y,size=38):
    text(num,x,y+5,22,SAGE,True)
    text(title,x+65,y,size,INK,True)

def flow(labels,x,y,w,label,result,fill):
    rect(x,y,w,306,fill,r=16)
    text(label,x+32,y+23,27,INK,True)
    text('Execution order',x+32,y+69,22,MUTED)
    start=x+280; bw=120; gap=75
    for i,ch in enumerate(labels):
        xx=start+i*(bw+gap)
        if ch=='A':
            c.setFillColor(HexColor(SAGE));c.circle(xx+60,H-y-123,55,stroke=0,fill=1)
            text(ch,xx+42,y+88,45,'#ffffff',True)
        else:
            rect(xx+5,y+68,110,110,RUST,r=8)
            text(ch,xx+42,y+88,45,'#ffffff',True)
        if i<3:
            line(xx+bw+12,y+123,xx+bw+gap-13,y+123,INK,4)
            line(xx+bw+gap-25,y+114,xx+bw+gap-13,y+123,INK,4)
            line(xx+bw+gap-25,y+132,xx+bw+gap-13,y+123,INK,4)
    eq(result,x+125,y+215,w-250,58,42,bg=fill)

# A centered conference masthead and a full-width research takeaway.
rect(0,0,W,H,PAPER)
rect(0,0,W,370,INK)
text('DEEPMATH 2026  /  ACCEPTED CONFERENCE POSTER',72,36,23,'#c0d8ce',True)
def centered(s,y,size,color='#ffffff',font='Display'):
    text(s,(W-pdfmetrics.stringWidth(s,font,size))/2,y,size,color,font=font)
centered('Vijay Bommireddy  ·  Presenter / Independent researcher',35,24,'#e4ebe7','Body')
centered('Weight-Sharing Order',102,83)
centered('Changes Linear Expressivity',199,83)
centered('Separation and Commutator Bounds',309,31,'#c0d8ce','Body')
c.saveState()
clip=c.beginPath();clip.circle(3230,H-157,77);c.clipPath(clip,stroke=0)
c.drawImage(str(ROOT/'assets/vijay-bommireddy.jpg'),3153,H-234,154,154,mask='auto')
c.restoreState()
text('October 29-30, 2026',3070,265,22,'#e4ebe7')
text('Columbus, Ohio',3101,305,22,'#c0d8ce')
rect(0,370,W,54,MINT)
centered('Two matrices. Four layers. Different representable maps.',380,26,SAGE,'Bold')

# Main narrative runs across two thirds of the canvas.
heading('01','Same weights. Different order.',72,439)
para('Can reuse order change what a linear network can represent?',72,507,2352,33,MUTED)
flow('ABAB',72,583,1147,'ALTERNATING',r'$T_{ABAB}=BABA=(BA)^2$',MINT)
flow('AABB',1253,583,1171,'BLOCK',r'$T_{AABB}=B^2A^2$',ROSE)
for xx,value,label in [(88,'2','real matrices'),(650,'4','layers'),(1212,'(2, 2)','reuse frequency'),(1835,'2n²','parameters')]:
    text(value,xx,930,48,SAGE,True)
    text(label,xx+165,947,24,MUTED)
line(72,1020,2424,1020)

heading('02','A strict expressivity separation',72,1053)
text('For real n × n matrices, n ≥ 2, the block family is strictly larger.',72,1125,29,MUTED)
eq(r'$\{(BA)^2\}\;\subsetneq\;\{B^2A^2\}$',72,1195,1050,93,48)
eq(r'$A=\left(\genfrac{}{}{0}{}{0\quad -1}{1\quad\;0}\right),\; B=\mathrm{diag}(1,2),\; B^2A^2=\mathrm{diag}(-1,-4)$',1210,1190,1214,110,39)
steps=[('1','Inclusion','Every alternating map is a real matrix square. Every real matrix square is also a block map: take A = I.'),('2','A witness','If C² = D = diag(−1, −4), then C commutes with D and preserves its one-dimensional −1 eigenspace.'),('3','An obstruction','On that eigenspace, a real scalar would have to square to −1. Hence D has no real square root.')]
for i,(n,title,s) in enumerate(steps):
    xx=72+i*804
    text(n,xx,1345,45,SAGE,font='Display')
    text(title,xx+63,1357,28,INK,True)
    para(s,xx,1423,738,26,leading=36)
para('Extend A and B with identity blocks for n &gt; 2. <b>The separation holds even with invertible weights.</b>',72,1570,2352,25,MUTED,34)
line(72,1640,2424,1640)

heading('03','Evidence, with the limits in view',72,1671)
para('<b>MNIST + Fashion-MNIST:</b> 60,000 train / 10,000 test each. Training-only PCA: n = 16, 32.<br/>Four schedules × ten seeds = 160 fits. AABB / ABAB use matched initial weights.',72,1742,2352,26,leading=36)
text('Test accuracy (%) · mean ± sample SD, ten seeds',72,1848,24,INK,True)
x=72; cols=[x,x+355,x+445,x+780]; tablew=1174
rect(x,1900,tablew,52,MINT)
for xx,s in zip(cols,['Dataset','n','AABB','ABAB']):text(s,xx+10,1910,23,SAGE,True)
rows=[['MNIST','16','77.550 ± 0.000','77.556 ± 0.008'],['MNIST','32','83.600 ± 0.000','83.560 ± 0.000'],['Fashion-MNIST','16','71.520 ± 0.000','72.008 ± 0.033'],['Fashion-MNIST','32','75.960 ± 0.000','76.034 ± 0.011']]
for i,row in enumerate(rows):
    yy=1955+i*53
    for xx,s in zip(cols,row):text(s,xx+10,yy+8,23)
    line(x,yy+52,x+tablew,yy+52)
text('1,200 dependent comparisons',1340,1848,27,INK,True)
para('80 learned models × 15 pairs of reorderings',1340,1894,1084,23,MUTED)
for yy,pct,count,label,baseline in [(1953,'77.5%','930 / 1,200','Uniform bound','Improves norm-only baseline 2M⁴'),(2070,'7.7%','92 / 1,200','Transported bound','Improves tighter baseline ‖Tσ‖ + ‖Tτ‖')]:
    text(pct,1340,yy,51,SAGE,True)
    text(label,1608,yy+2,26,INK,True)
    text(baseline,1608,yy+42,23,MUTED)
    text(count,1340,yy+65,21,MUTED)
text('Bias-free linear maps · L-BFGS-B · MSE + 10⁻⁴‖T‖²F penalty',72,2175,21,MUTED)
text('Different baselines; descriptive, dependent comparisons.',1340,2175,21,MUTED)
rect(72,2220,2352,128,ROSE,r=10)
para('<b>80 / 160 fits hit the 10,000-iteration cap.</b> All AAAA and ABAB fits hit the cap; all AABB and ABCD fits met stopping criteria. These are finite-budget outcomes, not a demonstrated classification advantage.',95,2238,2306,25,leading=34)

# A continuous contrasting column replaces the old matching six-panel layout.
rect(2484,439,900,1909,MINT,r=16)
x=2522
heading('04','Sensitivity to order',x,474,35)
para('For fixed weights, an adjacent swap contributes a commutator scaled by the surrounding factors.',x,550,824,28,leading=39)
eq(r'$\Delta T=P[W_j,W_i]Q$',x+60,714,704,66,44,bg=MINT)
eq(r'$[A,B]=AB-BA$',x+135,800,554,53,38,bg=MINT)
line(x,900,x+824,900,SAGE,2)
text('TRANSPORTED BOUND',x,937,22,SAGE,True)
eq(r'$\|T_\sigma-T_\tau\|\leq\min_\gamma\sum_{r\in\gamma}\|P_r\|\,\|[W_{j_r},W_{i_r}]\|\,\|Q_r\|$',x,995,824,93,37,bg=MINT)
text('UNIFORM BOUND',x,1125,22,SAGE,True)
eq(r'$\|T_\sigma-T_\tau\|\leq M^{L-2}C_W(\sigma,\tau)$',x+10,1178,804,65,42,bg=MINT)
para('M is the maximum weight norm; C<sub>W</sub> is the minimum sum of commutator norms along adjacent-swap paths. All norms are spectral.',x,1284,824,24,MUTED,34)
text('An exactly attainable regime',x,1420,29,INK,True)
fig,ax=plt.subplots(figsize=(8.3,3.5))
fig.patch.set_facecolor(MINT);ax.set_facecolor(MINT)
angles=[i*math.pi/200 for i in range(101)]
ax.plot(angles,[2*math.sin(v) for v in angles],color=SAGE,lw=3.2)
ax.axhline(2,color=RUST,lw=2.5,ls='--')
ax.set_xlim(0,math.pi/2);ax.set_ylim(0,2.22)
ax.set_xticks([0,math.pi/4,math.pi/2],['0','π/4','π/2']);ax.set_yticks([0,1,2])
ax.set_xlabel('Rotation angle θ',fontsize=13);ax.set_ylabel('Spectral norm',fontsize=13)
ax.tick_params(labelsize=12);ax.grid(axis='y',color=LINE)
ax.spines[['top','right']].set_visible(False)
fig.tight_layout();buf=BytesIO();fig.savefig(buf,format='pdf');plt.close(fig)
overlays.append((buf.getvalue(),fitz.Rect(x,1480,x+824,1827)))
line(x+8,1860,x+63,1860,SAGE,5)
text('Exact difference = commutator bounds',x+80,1842,22)
c.setDash(12,8);line(x+8,1902,x+63,1902,RUST,4);c.setDash()
text('Norm-only bound',x+80,1884,22)
para('Analytic example: A = diag(1, −1), B = R(θ), identity exterior factors. Both commutator bounds equal 2|sin θ|; the norm-only bound is 2.',x,1940,824,23,MUTED,32)
line(x,2083,x+824,2083,SAGE,2)
text('Different maps, same Gram geometry',x,2115,26,INK,True)
para('With orthogonal factors, every ordering gives:',x,2165,824,24,MUTED)
eq(r'$X^\top T_\sigma^\top T_\sigma X=X^\top X$',x+90,2240,644,55,40,bg=MINT)

line(72,2391,3384,2391,SAGE,3)
text('Sharing order is an architectural choice.',72,2421,36,font='Display')
para('Representability, sensitivity, and predictive performance are separate questions. Optimization failure is not proof of nonrepresentability; claims about nonlinear LLMs require separate evidence.',72,2481,1930,24,MUTED,33)
text('SELECTED REFERENCES',2100,2421,21,SAGE,True)
para('Takase &amp; Kiyono (2023), SustaiNLP, pp. 78-90.<br/>Gallier, Logarithms and square roots of real matrices, arXiv:0805.0245.<br/>Childs et al. (2021), Physical Review X 11:011020.',2100,2462,1284,21,MUTED,29)
c.showPage();c.save()
doc=fitz.open(Path(tmp.name)/'base.pdf');page=doc[0]
for data,dst in overlays:
    src=fitz.open(stream=data,filetype='pdf');page.show_pdf_page(dst,src,0);src.close()
doc.set_metadata({'title':'Weight-Sharing Order Changes Linear Expressivity: Separation and Commutator Bounds','author':'Vijay Bommireddy - presenter','subject':'DeepMath 2026 | Accepted conference poster | 48 x 36 inches'})
doc.save(OUT,garbage=4,deflate=True)
pix=page.get_pixmap(matrix=fitz.Matrix(1200/W,1200/W))
Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(OUT.with_suffix('.webp'),quality=90,method=6)
doc.close();tmp.cleanup()
print(OUT)
