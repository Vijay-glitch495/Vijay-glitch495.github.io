"""Build the 48 x 36 inch DeepMath poster. Requires reportlab, matplotlib, PyMuPDF.

Numerical values and claims transcribed from the owner's supplied manuscript.
The manuscript itself is intentionally not included in this repository.
The supplied Hankel poster provides the unchanged presenter identity card.
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
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/posters/deepmath-2026-weight-sharing-poster.pdf'
W, H = 3456, 2592
NAVY, TEAL, BLUE, ORANGE = '#153958', '#008f98', '#267eac', '#ed6536'
INK, MUTED, LINE = '#25415a', '#526879', '#d0dce4'
PALE, MINT, PEACH, LILAC = '#eaf3f9', '#eaf8f5', '#fff0e9', '#f2edf9'
for name, weight in [('Body','normal'), ('Bold','bold')]:
    pdfmetrics.registerFont(TTFont(name, findfont(FontProperties(family='DejaVu Sans', weight=weight))))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold')
tmp = tempfile.TemporaryDirectory()
c = canvas.Canvas(str(Path(tmp.name)/'base.pdf'), pagesize=(W,H))
c.setTitle('Weight-Sharing Order Changes Linear Expressivity: Separation and Commutator Bounds')
c.setAuthor('Vijay Bommireddy — presenter')
c.setSubject('DeepMath 2026 | 48 x 36 inch research poster')
overlays = []

def rect(x,y,w,h,fill='#ffffff',stroke=LINE,r=9):
    c.setFillColor(HexColor(fill)); c.setStrokeColor(HexColor(stroke)); c.setLineWidth(2)
    c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=1)

def text(s,x,y,size=28,color=INK,bold=False):
    c.setFillColor(HexColor(color)); c.setFont('Bold' if bold else 'Body',size)
    c.drawString(x,H-y-size,s)

def para(s,x,y,w,size=27,color=INK,leading=None):
    p=Paragraph(s,ParagraphStyle('p',fontName='Body',fontSize=size,leading=leading or size*1.38,textColor=HexColor(color)))
    _,h=p.wrap(w,2000); p.drawOn(c,x,H-y-h)
    return y+h

def line(x1,y1,x2,y2,color=LINE,width=2):
    c.setStrokeColor(HexColor(color));c.setLineWidth(width);c.line(x1,H-y1,x2,H-y2)

def eq(s,x,y,w,h,size=40):
    buf=BytesIO()
    math_to_image(s,buf,prop=FontProperties(size=size),format='pdf',color=NAVY)
    overlays.append((buf.getvalue(),fitz.Rect(x,y,x+w,y+h)))

def panel(num,title,x,y,w,h,color=TEAL):
    rect(x,y,w,h)
    rect(x+10,y+10,w-20,60,PALE,PALE,5)
    rect(x+22,y+22,39,36,color,color,5)
    text(num,x+27,y+24,22,'#ffffff',True)
    text(title,x+82,y+22,29,NAVY,True)

def flow(labels,x,y,w,label,result):
    text(label,x,y,28,TEAL if labels=='ABAB' else ORANGE,True)
    text('Execution order →',x,y+45,23,MUTED)
    bw=122; gap=45; start=x+235
    for i,ch in enumerate(labels):
        xx=start+i*(bw+gap)
        rect(xx,y+35,bw,95,MINT if ch=='A' else PEACH,TEAL if ch=='A' else ORANGE)
        text(ch,xx+43,y+49,46,TEAL if ch=='A' else ORANGE,True)
        if i<3:
            line(xx+bw+8,y+83,xx+bw+gap-8,y+83,MUTED,3)
            line(xx+bw+gap-17,y+75,xx+bw+gap-8,y+83,MUTED,3)
            line(xx+bw+gap-17,y+91,xx+bw+gap-8,y+83,MUTED,3)
    eq(result,x+215,y+158,w-250,70,42)

rect(0,0,W,H,'#f5f8fb','#f5f8fb',0)
rect(0,0,W,14,TEAL,TEAL,0)
rect(48,48,9,265,TEAL,TEAL,0)
text('Weight-Sharing Order',92,44,89,NAVY,True)
text('Changes Linear Expressivity',92,145,76,NAVY,True)
text('Separation and Commutator Bounds',96,250,43,BLUE,True)
rect(48,339,3360,82,MINT,LINE,0)
text('CENTRAL IDEA',80,363,28,NAVY,True)
para('Same parameter count. Same reuse frequency. Different representable maps.<br/>Commutators quantify what happens when fixed weights are reordered.',388,350,2900,25,NAVY,31)

xs=[48,1176,2304]; cw=1104; top=446; ph=1060
panel('01','Motivation & research question',xs[0],top,cw,ph)
x=xs[0]+32
para('Does layer order matter when two networks reuse exactly the same number of weight matrices?',x,541,1040,31,NAVY)
flow('ABAB',x,670,1040,'ALTERNATING',r'$T_{ABAB}=BABA=(BA)^2$')
flow('AABB',x,955,1040,'BLOCK',r'$T_{AABB}=B^2A^2$')
rect(x,1234,1040,111,PALE)
text('2 real matrices',x+24,1250,29,NAVY,True)
text('4 layers',x+415,1250,29,NAVY,True)
text('Reuse: (2, 2)',x+708,1250,29,NAVY,True)
text('Both schedules have 2n² trainable parameters.',x+24,1298,25,MUTED)
rect(x,1364,1040,109,MINT)
para('<b>Answer: yes.</b> For every n ≥ 2, block sharing can represent real linear maps that alternating sharing cannot.',x+22,1382,996,27,NAVY)

panel('02','Exact expressivity separation',xs[1],top,cw,ph,BLUE)
x=xs[1]+32
text('For real n × n matrices, n ≥ 2:',x,540,28,NAVY,True)
rect(x,592,1040,120,MINT)
eq(r'$\{(BA)^2\}\;\subsetneq\;\{B^2A^2\}$',x+60,615,920,68,46)
text('A concrete witness in two dimensions',x,745,29,NAVY,True)
eq(r'$A=\left(\genfrac{}{}{0}{}{0\quad -1}{1\quad\; 0}\right),\quad B=\mathrm{diag}(1,2)$',x+30,801,980,106,43)
eq(r'$B^2A^2=D=\mathrm{diag}(-1,-4)$',x+35,949,970,80,43)
steps=[('1','Every alternating map is a real matrix square. Every such square is also attainable by block sharing (take A = I).'),('2','If C² = D, then C commutes with D. Thus C preserves the one-dimensional −1 eigenspace.'),('3','On that eigenspace, a real scalar would have to square to −1. This is impossible: D has no real square root.')]
y=1070
for n,s in steps:
    rect(x,y+3,38,38,BLUE,BLUE,19);text(n,x+11,y+6,24,'#ffffff',True)
    para(s,x+59,y,973,25); y+=111
line(x,1411,x+1040,1411)
para('Extend A and B with identity blocks for n &gt; 2.<br/><b>The separation holds even with invertible weights.</b>',x,1426,1040,23,MUTED,30)

panel('03','Fixed weights: sensitivity to order',xs[2],top,cw,ph,ORANGE)
x=xs[2]+32
para('An adjacent swap contributes a commutator, scaled by the factors surrounding it.',x,540,1040,28)
eq(r'$\Delta T=P[W_j,W_i]Q,\qquad [A,B]=AB-BA$',x+10,634,1020,66,37)
rect(x,728,1040,215,PALE)
eq(r'$\|T_\sigma-T_\tau\|\leq\min_\gamma\sum_{r\in\gamma}\|P_r\|\,\|[W_{j_r},W_{i_r}]\|\,\|Q_r\|$',x+25,747,990,86,35)
eq(r'$\leq M^{L-2}C_W(\sigma,\tau)$',x+160,848,720,58,39)
para('M = max weight norm; C<sub>W</sub> is the minimum sum of commutator norms along adjacent-swap paths. All norms are spectral.',x,963,1040,23,MUTED,31)
text('An exactly attainable regime',x,1044,28,NAVY,True)
# Analytic illustration, not experimental measurements.
fig,ax=plt.subplots(figsize=(10.7,3.05))
fig.patch.set_alpha(0);ax.set_facecolor('white')
angles=[i*math.pi/200 for i in range(101)]
ax.plot(angles,[2*math.sin(v) for v in angles],color=TEAL,lw=3.5,label='Exact difference = commutator bound')
ax.axhline(2,color=ORANGE,lw=2,ls='--',label='Norm-only bound')
ax.set_xlim(0,math.pi/2);ax.set_ylim(0,2.22)
ax.set_xticks([0,math.pi/4,math.pi/2],['0','π/4','π/2']);ax.set_yticks([0,1,2])
ax.set_xlabel('Rotation angle θ',fontsize=12);ax.set_ylabel('Spectral norm',fontsize=12)
ax.tick_params(labelsize=11);ax.grid(axis='y',color=LINE)
ax.spines[['top','right']].set_visible(False)
ax.legend(loc='lower right',fontsize=9,frameon=False)
fig.tight_layout(); buf=BytesIO();fig.savefig(buf,format='pdf',transparent=True);plt.close(fig)
overlays.append((buf.getvalue(),fitz.Rect(x,1091,x+1040,1387)))
para('Analytic example: A = diag(1, −1), B = R(θ), identity exterior factors. Both commutator bounds equal 2|sin θ|; the norm-only bound is 2.',x,1400,1040,23,MUTED,30)

bottom=1530;bh=760
panel('04','Full-data evaluation',xs[0],bottom,cw,bh,BLUE)
x=xs[0]+32
para('<b>MNIST + Fashion-MNIST:</b> 60,000 train / 10,000 test each.<br/>Training-only PCA: n = 16, 32 · 4 schedules · 10 seeds.<br/>160 fits; AABB / ABAB use matched initial weights.',x,1621,1040,24,leading=34)
text('Test accuracy (%) · mean ± sample SD, ten seeds',x,1748,24,NAVY,True)
cols=[x,x+362,x+462,x+752]
headers=['Dataset','n','AABB','ABAB']
rect(x,1794,1040,54,PALE,PALE,0)
for xx,s in zip(cols,headers):text(s,xx+12,1804,24,NAVY,True)
rows=[['MNIST','16','77.550 ± 0.000','77.556 ± 0.008'],['MNIST','32','83.600 ± 0.000','83.560 ± 0.000'],['Fashion-MNIST','16','71.520 ± 0.000','72.008 ± 0.033'],['Fashion-MNIST','32','75.960 ± 0.000','76.034 ± 0.011']]
for i,row in enumerate(rows):
    yy=1850+i*53
    for xx,s in zip(cols,row):text(s,xx+12,yy+8,23)
    line(x,yy+52,x+1040,yy+52)
rect(x,2080,1040,116,PEACH)
para('<b>80 / 160 fits reached the 10,000-iteration cap.</b><br/>All AAAA and ABAB fits hit the cap; all AABB and ABCD fits satisfied stopping criteria. These are finite-budget outcomes.',x+20,2095,1000,24,leading=31)
para('Bias-free linear maps · L-BFGS-B · MSE with 10⁻⁴‖T‖²<sub>F</sub> penalty.<br/>The results do not establish a classification advantage.',x,2214,1040,22,MUTED,29)

panel('05','How useful are the bounds?',xs[1],bottom,cw,bh,TEAL)
x=xs[1]+32
para('80 learned AABB / ABAB models × 15 pairs of reorderings<br/>= <b>1,200 dependent comparisons</b>.',x,1621,1040,26,leading=36)
for yy,pct,count,title,baseline,color,fill in [(1730,77.5,'930 / 1,200','Uniform bound','Improves the norm-only baseline 2M⁴',TEAL,MINT),(1968,7.7,'92 / 1,200','Transported bound','Improves the tighter baseline ‖Tσ‖ + ‖Tτ‖',ORANGE,PEACH)]:
    rect(x,yy,1040,215,fill)
    text(f'{pct}%',x+23,yy+15,64,color,True)
    text(title,x+310,yy+23,29,NAVY,True)
    text(baseline,x+310,yy+77,24)
    text(count+' comparisons',x+27,yy+104,23,MUTED)
    rect(x+27,yy+159,986,24,'#dce5e8','#dce5e8',3)
    rect(x+27,yy+159,986*pct/100,24,color,color,3)
para('<b>Different baselines; not a head-to-head win rate.</b><br/>These dependent comparisons are descriptive, not independent trials.',x,2210,1040,23,MUTED,30)

panel('06','Interpretation, scope & next steps',xs[2],bottom,cw,bh,'#8056a7')
x=xs[2]+32
items=[(1624,'REPRESENTABILITY', 'A strict result for real, deep linear networks and full linear maps. Equal parameter counts need not imply equal expressivity.',MINT,TEAL),(1820,'GEOMETRY & PERFORMANCE','Different maps need not change output Gram geometry. With orthogonal factors, XᵀTᵀTX = XᵀX for every ordering.',PALE,BLUE),(2016,'OPTIMIZATION & SCOPE','Optimization failure is not proof of nonrepresentability. Classification gains and results for nonlinear LLMs require separate evidence.',PEACH,ORANGE)]
for yy,title,s,fill,color in items:
    rect(x,yy,1040,172,fill)
    text(title,x+23,yy+18,24,color,True)
    para(s,x+23,yy+61,994,25,leading=34)
text('Report these three questions separately.',x+4,2224,26,NAVY,True)

rect(48,2314,1890,230,'#ffffff',LINE,20)
text('The takeaway',80,2335,32,NAVY,True)
para('<b>Sharing order is an architectural choice.</b><br/>It can change the set of representable linear maps. Commutators certify sensitivity to reordering fixed weights. Neither result alone establishes better predictive performance.',80,2391,1820,29,leading=40)
rect(1962,2314,1446,230,'#ffffff',LINE,10)
text('Selected references',1990,2335,28,NAVY,True)
para('1. Takase &amp; Kiyono. Lessons on parameter sharing across layers in transformers. SustaiNLP, 2023.<br/>2. Gallier. Logarithms and square roots of real matrices. arXiv:0805.0245.<br/>3. Childs et al. Theory of Trotter error with commutator scaling. Physical Review X 11:011020, 2021.',1990,2383,1384,22,MUTED,31)
c.showPage();c.save()
doc=fitz.open(Path(tmp.name)/'base.pdf');page=doc[0]
for data,dst in overlays:
    src=fitz.open(stream=data,filetype='pdf');page.show_pdf_page(dst,src,0);src.close()
# Preserve the supplied poster's portrait, name and conference artwork as PDF content.
src=fitz.open(ROOT/'assets/posters/deepmath-2026-hankel-poster.pdf')
page.show_pdf_page(fitz.Rect(2678,40,3406,326),src,0,clip=fitz.Rect(2678,40,3406,326))
doc.set_metadata({'title':'Weight-Sharing Order Changes Linear Expressivity: Separation and Commutator Bounds','author':'Vijay Bommireddy — presenter','subject':'DeepMath 2026 | 48 × 36 inch poster'})
doc.save(OUT,garbage=4,deflate=True)
doc.close();src.close();tmp.cleanup()
print(OUT)
