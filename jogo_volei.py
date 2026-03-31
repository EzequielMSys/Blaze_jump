import pygame
import sys
import math
import random

pygame.init()

# Tela
WIDTH, HEIGHT = 900, 450
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Fire vs Water Volleyball")

clock = pygame.time.Clock()
font = pygame.font.SysFont("arial", 36)
big_font = pygame.font.SysFont("arial", 72)

# Cores
SKY = (135, 206, 235)
GROUND = (60, 180, 90)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
SHADOW = (50, 50, 50)

# Sprites
player1_img = pygame.image.load("fire.png").convert_alpha()
player2_img = pygame.image.load("water.png").convert_alpha()

player1_img = pygame.transform.scale(player1_img, (70, 70))
player2_img = pygame.transform.scale(player2_img, (70, 70))

# Jogadores
p1_pos = [200, 360]
p2_pos = [700, 360]
RADIUS = 30

vel = 6
jump_power = 13
gravity = 0.5

p1_y_vel = 0
p2_y_vel = 0

# Bola
ball_pos = [WIDTH//2, HEIGHT//2]
ball_vel = [0, 0]
BALL_RADIUS = 14
ball_started = False

# Partículas
particles = []

# Rede
net = pygame.Rect(WIDTH//2 - 5, HEIGHT - 180, 10, 180)

# Pontos
score1 = 0
score2 = 0

state = "menu"


def draw_shadow(x, radius):
    pygame.draw.ellipse(screen, SHADOW, (x-radius, HEIGHT-30, radius*2, 10))


def create_particles(x, y, color):
    for _ in range(10):
        particles.append([
            [x, y],
            [random.uniform(-2, 2), random.uniform(-3, 0)],
            random.randint(4, 7),
            color
        ])


def update_particles():
    for p in particles[:]:
        p[0][0] += p[1][0]
        p[0][1] += p[1][1]
        p[1][1] += 0.2
        p[2] -= 0.2

        if p[2] <= 0:
            particles.remove(p)


def draw_particles():
    for p in particles:
        pygame.draw.circle(screen, p[3], (int(p[0][0]), int(p[0][1])), int(p[2]))


def draw_game():
    screen.fill(SKY)

    pygame.draw.rect(screen, GROUND, (0, HEIGHT-40, WIDTH, 40))

    draw_shadow(p1_pos[0], RADIUS)
    draw_shadow(p2_pos[0], RADIUS)
    draw_shadow(ball_pos[0], BALL_RADIUS)

    # partículas atrás
    draw_particles()

    screen.blit(player1_img, (p1_pos[0] - 35, p1_pos[1] - 35))
    screen.blit(player2_img, (p2_pos[0] - 35, p2_pos[1] - 35))

    pygame.draw.circle(screen, WHITE, (int(ball_pos[0]), int(ball_pos[1])), BALL_RADIUS)
    pygame.draw.circle(screen, BLACK, (int(ball_pos[0]), int(ball_pos[1])), BALL_RADIUS, 2)

    pygame.draw.rect(screen, BLACK, net)

    score_text = font.render(f"{score1}  x  {score2}", True, BLACK)
    screen.blit(score_text, (WIDTH//2 - 50, 20))

    if not ball_started:
        msg = font.render("ESPAÇO para sacar", True, BLACK)
        screen.blit(msg, (WIDTH//2 - 150, HEIGHT//2 - 50))

    pygame.display.flip()


def draw_menu():
    screen.fill(SKY)
    title = big_font.render("FIRE VS WATER", True, BLACK)
    start = font.render("ENTER para jogar", True, BLACK)

    screen.blit(title, (WIDTH//2 - 200, HEIGHT//2 - 100))
    screen.blit(start, (WIDTH//2 - 130, HEIGHT//2))

    pygame.display.flip()


def reset_ball():
    global ball_started
    ball_pos[0] = WIDTH // 2
    ball_pos[1] = HEIGHT // 2
    ball_vel[0] = 0
    ball_vel[1] = 0
    ball_started = False


def collide(px, py, px_vel, color):
    dx = ball_pos[0] - px
    dy = ball_pos[1] - py
    dist = math.hypot(dx, dy)

    if dist < RADIUS + BALL_RADIUS:
        angle = math.atan2(dy, dx)
        speed = 7 + abs(px_vel)*0.5

        ball_vel[0] = math.cos(angle) * speed
        ball_vel[1] = math.sin(angle) * speed

        create_particles(ball_pos[0], ball_pos[1], color)

        overlap = RADIUS + BALL_RADIUS - dist
        ball_pos[0] += math.cos(angle) * overlap
        ball_pos[1] += math.sin(angle) * overlap


running = True
while running:
    clock.tick(60)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if event.type == pygame.KEYDOWN:
            if state == "menu" and event.key == pygame.K_RETURN:
                state = "game"

            if state == "game" and event.key == pygame.K_SPACE and not ball_started:
                ball_vel = [4, -6]
                ball_started = True

    if state == "menu":
        draw_menu()
        continue

    keys = pygame.key.get_pressed()

    p1_vel_x = 0
    p2_vel_x = 0

    if keys[pygame.K_a]:
        p1_pos[0] -= vel
        p1_vel_x = -vel
    if keys[pygame.K_d]:
        p1_pos[0] += vel
        p1_vel_x = vel
    if keys[pygame.K_w] and p1_pos[1] >= 360:
        p1_y_vel = -jump_power

    if keys[pygame.K_LEFT]:
        p2_pos[0] -= vel
        p2_vel_x = -vel
    if keys[pygame.K_RIGHT]:
        p2_pos[0] += vel
        p2_vel_x = vel
    if keys[pygame.K_UP] and p2_pos[1] >= 360:
        p2_y_vel = -jump_power

    p1_y_vel += gravity
    p2_y_vel += gravity

    p1_pos[1] += p1_y_vel
    p2_pos[1] += p2_y_vel

    if p1_pos[1] >= 360:
        p1_pos[1] = 360
        p1_y_vel = 0

    if p2_pos[1] >= 360:
        p2_pos[1] = 360
        p2_y_vel = 0

    p1_pos[0] = max(RADIUS, min(p1_pos[0], WIDTH//2 - 20))
    p2_pos[0] = max(WIDTH//2 + 20, min(p2_pos[0], WIDTH - RADIUS))

    if ball_started:
        ball_pos[0] += ball_vel[0]
        ball_pos[1] += ball_vel[1]

        ball_vel[1] += 0.3
        ball_vel[0] *= 0.999

        if ball_pos[0] <= BALL_RADIUS or ball_pos[0] >= WIDTH - BALL_RADIUS:
            ball_vel[0] *= -0.9

        if ball_pos[1] <= BALL_RADIUS:
            ball_vel[1] *= -0.9

        collide(p1_pos[0], p1_pos[1], p1_vel_x, (255,100,0))
        collide(p2_pos[0], p2_pos[1], p2_vel_x, (0,150,255))

        if net.collidepoint(ball_pos[0], ball_pos[1]):
            ball_vel[0] *= -0.8

        if ball_pos[1] >= HEIGHT - BALL_RADIUS:
            ball_vel[1] *= -0.6

            if abs(ball_vel[1]) < 2:
                if ball_pos[0] < WIDTH//2:
                    score2 += 1
                else:
                    score1 += 1
                reset_ball()

    update_particles()
    draw_game()

pygame.quit()
sys.exit()
