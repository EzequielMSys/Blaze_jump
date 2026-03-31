import pygame
import sys
import math
import random
from time import time

# ===== CONFIG =====
WIDTH, HEIGHT = 900, 450
FPS = 60
PLAYER_SIZE = 80
BALL_RADIUS = 14
VEL = 6
JUMP = 13
GRAVITY = 0.5
COOLDOWN = 1.0

# ===== INIT =====
pygame.mixer.pre_init(44100, -16, 2, 512)
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Blaze Vôlei")
clock = pygame.time.Clock()
font = pygame.font.SysFont("arial", 36)
small_font = pygame.font.SysFont("arial", 24)

# ===== LOAD IMAGES =====
def load_img(path, size=(PLAYER_SIZE, PLAYER_SIZE)):
    try:
        return pygame.transform.scale(pygame.image.load(path), size)
    except:
        surf = pygame.Surface(size)
        surf.fill((255,0,255))
        return surf

p1_img = load_img("fire.png")
p2_img = load_img("water.png")
sand_img = load_img("sand.png", (WIDTH, 100))
cloud_img = load_img("cloud.png", (100, 60))

# ===== AUDIO =====
def load_sound(path):
    try:
        return pygame.mixer.Sound(path)
    except:
        return None

try:
    pygame.mixer.music.load("music.wav")
    pygame.mixer.music.set_volume(0.3)
    pygame.mixer.music.play(-1)
except:
    print("Erro música")

point_sound = load_sound("mogged.wav")

# ===== GAME VARS =====
p1 = [200, 350]
p2 = [700, 350]
p1_y = 0
p2_y = 0
ball = [WIDTH//2, HEIGHT//2]
ball_vel = [0,0]
ball_started = False
net = pygame.Rect(WIDTH//2-5, HEIGHT-180, 10, 180)
score1 = 0
score2 = 0
state = "menu"
last_skill = 0
cpu = True
clouds = [[random.randint(0, WIDTH), random.randint(0,150)] for _ in range(5)]
pause_menu_options = ["Continuar", "Recomeçar Partida", "Voltar ao Lobby"]
pause_selected = 0

# ===== FUNCS =====
def reset_ball():
    global ball_started
    ball[:] = [WIDTH//2, HEIGHT//2]
    ball_vel[:] = [0,0]
    ball_started = False

def collide(px, py):
    dx = ball[0] - px
    dy = ball[1] - py
    dist = math.hypot(dx, dy)
    if dist < PLAYER_SIZE//2 + BALL_RADIUS:
        angle = math.atan2(dy, dx)
        speed = 8
        ball_vel[0] = math.cos(angle) * speed
        ball_vel[1] = math.sin(angle) * speed

def skill(power, lift):
    global last_skill
    if time() - last_skill < COOLDOWN:
        return
    last_skill = time()
    ball_vel[0] *= 1.2
    ball_vel[1] -= lift
    ball_vel[0] += power if ball_vel[0] > 0 else -power

# ===== MENU =====
def draw_menu(selected):
    screen.fill((135,206,235))  # céu azul
    screen.blit(font.render("Blaze Vôlei", True, (255,255,255)), (WIDTH//2 - 120, 100))
    for i, text in enumerate(["Jogar contra CPU", "Jogar Player 2"]):
        color = (255,0,0) if i==selected else (0,0,0)
        screen.blit(font.render(text, True, color), (WIDTH//2-150, 250 + i*50))
    pygame.display.flip()

# ===== PAUSE MENU =====
def draw_pause(selected):
    overlay = pygame.Surface((WIDTH, HEIGHT))
    overlay.set_alpha(180)
    overlay.fill((0,0,0))
    screen.blit(overlay, (0,0))
    screen.blit(font.render("PAUSADO", True, (255,255,255)), (WIDTH//2-80, 100))
    for i, option in enumerate(pause_menu_options):
        color = (255,0,0) if i==selected else (255,255,255)
        screen.blit(font.render(option, True, color), (WIDTH//2-120, 200 + i*50))
    pygame.display.flip()

# ===== LOOP =====
menu_selected = 0
running = True
while running:
    clock.tick(FPS)
    keys = pygame.key.get_pressed()

    for e in pygame.event.get():
        if e.type == pygame.QUIT:
            running = False
        elif e.type == pygame.KEYDOWN:
            # MENU NAV
            if state == "menu":
                if e.key == pygame.K_UP:
                    menu_selected = max(0, menu_selected-1)
                elif e.key == pygame.K_DOWN:
                    menu_selected = min(1, menu_selected+1)
                elif e.key == pygame.K_RETURN:
                    cpu = True if menu_selected == 0 else False
                    state = "game"
                    p1 = [200, 350]
                    p2 = [700, 350]
                    score1 = 0
                    score2 = 0
                    reset_ball()
            # PAUSE NAV
            elif state == "pause":
                if e.key == pygame.K_UP:
                    pause_selected = max(0, pause_selected-1)
                elif e.key == pygame.K_DOWN:
                    pause_selected = min(len(pause_menu_options)-1, pause_selected+1)
                elif e.key == pygame.K_RETURN:
                    option = pause_menu_options[pause_selected]
                    if option == "Continuar":
                        state = "game"
                    elif option == "Recomeçar Partida":
                        p1 = [200, 350]
                        p2 = [700, 350]
                        score1 = 0
                        score2 = 0
                        reset_ball()
                        state = "game"
                    elif option == "Voltar ao Lobby":
                        state = "menu"
                        menu_selected = 0

    # MENU
    if state == "menu":
        draw_menu(menu_selected)
        continue

    # INPUT
    start_click = keys[pygame.K_RETURN]
    select_click = keys[pygame.K_ESCAPE]

    # PAUSE
    if state == "game" and select_click:
        state = "pause"
        pause_selected = 0

    if state == "pause":
        draw_pause(pause_selected)
        continue

    # GAME
    # Fundo céu
    screen.fill((135,206,235))  # azul céu
    # Nuvens
    for cloud in clouds:
        screen.blit(cloud_img, cloud)
        cloud[0] += 0.3
        if cloud[0] > WIDTH:
            cloud[0] = -100
            cloud[1] = random.randint(0,150)
    # Chão de areia
    screen.blit(sand_img, (0, HEIGHT-100))

    # PLAYER 1
    if keys[pygame.K_a]: p1[0] -= VEL
    if keys[pygame.K_d]: p1[0] += VEL
    if keys[pygame.K_w] and p1[1]>=350: p1_y=-JUMP
    if keys[pygame.K_s]: p1[0] += VEL  # acelera
    if keys[pygame.K_e]: skill(5,5)
    if keys[pygame.K_f]: skill(10,2)
    if keys[pygame.K_t]: skill(3,8)
    if keys[pygame.K_g]: skill(15,0)

    # PLAYER 2 ou CPU
    if not cpu:
        if keys[pygame.K_LEFT]: p2[0] -= VEL
        if keys[pygame.K_RIGHT]: p2[0] += VEL
        if keys[pygame.K_UP] and p2[1]>=350: p2_y=-JUMP
        if keys[pygame.K_DOWN]: p2[0] += VEL
    else:
        # CPU mais inteligente
        target_x = ball[0]
        if abs(p2[0]-target_x) > 5:
            p2[0] += VEL if p2[0] < target_x else -VEL
        # Salto se bola acima
        if p2[1]>=350 and ball[1]<p2[1]-40 and ball[0] > WIDTH//2:
            p2_y = -JUMP

    # LIMITES
    p1[0] = max(0, min(p1[0], WIDTH//2 - PLAYER_SIZE))
    p2[0] = max(WIDTH//2, min(p2[0], WIDTH - PLAYER_SIZE))

    # FÍSICA
    p1_y += GRAVITY
    p2_y += GRAVITY
    p1[1] += p1_y
    p2[1] += p2_y
    if p1[1]>=350: p1[1]=350; p1_y=0
    if p2[1]>=350: p2[1]=350; p2_y=0

    # BOLA
    if ball_started:
        ball[0]+=ball_vel[0]
        ball[1]+=ball_vel[1]
        ball_vel[1]+=0.3
        collide(p1[0]+PLAYER_SIZE//2,p1[1]+PLAYER_SIZE//2)
        collide(p2[0]+PLAYER_SIZE//2,p2[1]+PLAYER_SIZE//2)
        if ball[1]>=HEIGHT-BALL_RADIUS:
            if ball[0]<WIDTH//2: score2+=1
            else: score1+=1
            if point_sound: pygame.mixer.find_channel(True).play(point_sound)
            reset_ball()
    else:
        if keys[pygame.K_RETURN]:
            ball_vel=[4,-6]
            ball_started=True

    # DESENHO
    screen.blit(p1_img, p1)
    screen.blit(p2_img, p2)
    pygame.draw.circle(screen,(255,255,255),ball,BALL_RADIUS)
    pygame.draw.rect(screen,(0,0,0),net)
    screen.blit(font.render(f"{score1} x {score2}", True, (0,0,0)),(420,20))
    pygame.display.flip()

pygame.quit()
sys.exit()